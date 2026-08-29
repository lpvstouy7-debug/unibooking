import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryPricing, Prisma, Role, Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { AddInventoryDto } from './dto/add-inventory.dto';
import {
  SearchServicesQueryDto,
  ServiceSortBy,
} from './dto/search-services-query.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// What a search result exposes about its supplier -- deliberately not the
// full Supplier row (no contactEmail/taxId) since this feeds a public endpoint.
const searchResultInclude = {
  supplier: { select: { companyName: true, isVerified: true } },
} satisfies Prisma.ServiceInclude;

export interface SearchResult {
  data: Array<
    Service & {
      supplier: { companyName: string; isVerified: boolean };
      inventory?: InventoryPricing[];
    }
  >;
  meta: { page: number; limit: number; total: number; totalPages: number };
}

function emptyPage(page: number, limit: number): SearchResult {
  return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
}

interface QualifyingService {
  serviceId: string;
  avgPrice: number;
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * A SUPPLIER always lists under their own profile, resolved from the JWT
   * -- dto.supplierId is only honoured for ADMIN (onboarding a listing on a
   * supplier's behalf). This is what stops one supplier account from
   * creating a Service under another supplier's id.
   */
  async create(dto: CreateServiceDto, user: JwtPayload): Promise<Service> {
    const supplierId = await this.resolveSupplierId(user, dto.supplierId);

    return this.prisma.service.create({
      data: {
        supplierId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        location: dto.location,
      },
    });
  }

  /**
   * Bulk-upserts price/availability per date, one row per (service, date).
   * Runs as a single transaction so a batch of 30 dates either lands
   * entirely or not at all -- never half-applied.
   */
  async addInventory(
    serviceId: string,
    dto: AddInventoryDto,
    user: JwtPayload,
  ): Promise<InventoryPricing[]> {
    await this.assertOwnsService(serviceId, user);

    return this.prisma.$transaction(
      dto.entries.map((entry) =>
        this.prisma.inventoryPricing.upsert({
          where: {
            serviceId_date: { serviceId, date: new Date(entry.date) },
          },
          create: {
            serviceId,
            date: new Date(entry.date),
            availableUnits: entry.availableUnits,
            price: entry.price,
          },
          update: {
            availableUnits: entry.availableUnits,
            price: entry.price,
          },
        }),
      ),
    );
  }

  /**
   * The overbooking-safe search: when a date range is given, a service only
   * qualifies if EVERY night in the range has a matching inventory row with
   * availableUnits > 0 -- not merely at least one. Implemented as a groupBy
   * count-per-service against the exact filter, compared to the number of
   * nights requested, rather than a relation `some: {...}` filter (which
   * would wrongly admit a service that's only available for part of the stay).
   *
   * Price isn't a column on Service -- it's set per night on
   * InventoryPricing -- so minPrice/maxPrice and price-based sorting only
   * mean something alongside a date range, and are rejected otherwise
   * rather than silently ignored or computed against something misleading.
   */
  async search(query: SearchServicesQueryDto): Promise<SearchResult> {
    const {
      location,
      type,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    } = query;

    if (Boolean(startDate) !== Boolean(endDate)) {
      throw new BadRequestException(
        'startDate and endDate must be provided together.',
      );
    }
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        'minPrice must not be greater than maxPrice.',
      );
    }

    const sortingByPrice =
      sortBy === ServiceSortBy.PRICE_ASC || sortBy === ServiceSortBy.PRICE_DESC;
    const needsDateRange =
      minPrice !== undefined || maxPrice !== undefined || sortingByPrice;
    if (needsDateRange && !(startDate && endDate)) {
      throw new BadRequestException(
        'minPrice, maxPrice, and price-based sorting all require startDate ' +
          'and endDate -- price is set per night, not per service.',
      );
    }

    const where: Prisma.ServiceWhereInput = {
      isActive: true,
      ...(type && { type }),
      ...(location && {
        location: { contains: location, mode: 'insensitive' },
      }),
    };

    if (!startDate || !endDate) {
      return this.searchCatalog(where, page, limit);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new BadRequestException('endDate must be after startDate.');
    }
    const requestedNights = Math.round(
      (end.getTime() - start.getTime()) / MS_PER_DAY,
    );

    // One groupBy answers both "is every night available" (the guarantee
    // above) and "what does this stay cost on average" -- Phase 07's price
    // filtering/sorting piggybacks on the same query rather than adding a
    // second round-trip.
    const availability = await this.prisma.inventoryPricing.groupBy({
      by: ['serviceId'],
      where: { date: { gte: start, lt: end }, availableUnits: { gt: 0 } },
      _count: { _all: true },
      _avg: { price: true },
    });

    const qualifying: QualifyingService[] = availability
      .filter((row) => row._count._all === requestedNights)
      .map((row) => ({
        serviceId: row.serviceId,
        avgPrice: Number(row._avg.price ?? 0),
      }))
      .filter((row) => minPrice === undefined || row.avgPrice >= minPrice)
      .filter((row) => maxPrice === undefined || row.avgPrice <= maxPrice);

    // Nothing has stock across the whole range (or nothing survives the
    // price filter) -- short-circuit rather than hand Prisma an
    // `id: { in: [] }` filter for a guaranteed-empty scan.
    if (qualifying.length === 0) {
      return emptyPage(page, limit);
    }

    const inventoryInclude = {
      inventory: {
        where: { date: { gte: start, lt: end } },
        orderBy: { date: 'asc' },
      },
    } satisfies Prisma.ServiceInclude;

    if (sortingByPrice) {
      return this.searchSortedByPrice(
        qualifying,
        sortBy === ServiceSortBy.PRICE_ASC,
        where,
        inventoryInclude,
        page,
        limit,
      );
    }

    const scopedWhere: Prisma.ServiceWhereInput = {
      ...where,
      id: { in: qualifying.map((row) => row.serviceId) },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where: scopedWhere,
        include: { ...searchResultInclude, ...inventoryInclude },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.service.count({ where: scopedWhere }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** No date range given -- a plain catalog browse, newest first, no price context to filter/sort by. */
  private async searchCatalog(
    where: Prisma.ServiceWhereInput,
    page: number,
    limit: number,
  ): Promise<SearchResult> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        include: searchResultInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Price-based sort can't be a Prisma `orderBy` on Service (there's no
   * price column to sort by) -- it's ranked in-memory from the per-service
   * average already produced by the availability groupBy, and paginated
   * over THAT ranking, so a price-sorted page 2 is the correct next slice
   * by price rather than a re-sort of an arbitrary DB page.
   */
  private async searchSortedByPrice(
    qualifying: QualifyingService[],
    ascending: boolean,
    where: Prisma.ServiceWhereInput,
    inventoryInclude: Prisma.ServiceInclude,
    page: number,
    limit: number,
  ): Promise<SearchResult> {
    const ranked = [...qualifying].sort((a, b) =>
      ascending ? a.avgPrice - b.avgPrice : b.avgPrice - a.avgPrice,
    );
    const total = ranked.length;
    const pageIds = ranked
      .slice((page - 1) * limit, (page - 1) * limit + limit)
      .map((row) => row.serviceId);

    const rows = await this.prisma.service.findMany({
      where: { ...where, id: { in: pageIds } },
      include: { ...searchResultInclude, ...inventoryInclude },
    });

    // `id: { in: [...] }` doesn't preserve array order -- re-sort the
    // fetched page to match the price ranking computed above.
    const rank = new Map(pageIds.map((id, index) => [id, index]));
    const data = rows.sort(
      (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
    );

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async resolveSupplierId(
    user: JwtPayload,
    requestedSupplierId?: string,
  ): Promise<string> {
    if (user.role === Role.ADMIN && requestedSupplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: requestedSupplierId },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with id "${requestedSupplierId}" not found.`,
        );
      }
      return supplier.id;
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { userId: user.sub },
    });
    if (!supplier) {
      throw new NotFoundException(
        'No supplier profile found for this account. Complete your supplier profile before listing services.',
      );
    }
    return supplier.id;
  }

  private async assertOwnsService(
    serviceId: string,
    user: JwtPayload,
  ): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { supplier: true },
    });
    if (!service) {
      throw new NotFoundException(`Service with id "${serviceId}" not found.`);
    }
    if (user.role !== Role.ADMIN && service.supplier.userId !== user.sub) {
      throw new ForbiddenException('You do not own this service.');
    }
    return service;
  }
}
