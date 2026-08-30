import { Injectable } from '@nestjs/common';
import { Prisma, Service, ServiceType, TransportDetails } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilitySearchService,
  CatalogSearchResult,
} from '../catalog/availability-search.service';
import { SupplierOwnershipService } from '../catalog/supplier-ownership.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTransportDto } from './dto/create-transport.dto';
import { TRANSPORT_SERVICE_TYPES, TransportSearchDto } from './dto/transport-search.dto';

export type TransportWithDetails = Service & { transportDetails: TransportDetails };

@Injectable()
export class TransportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilitySearch: AvailabilitySearchService,
    private readonly supplierOwnership: SupplierOwnershipService,
  ) {}

  async create(dto: CreateTransportDto, user: JwtPayload): Promise<TransportWithDetails> {
    const supplierId = await this.supplierOwnership.resolveSupplierId(
      user,
      dto.supplierId,
    );

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          supplierId,
          type: dto.type,
          name: dto.name,
          description: dto.description,
          location: dto.location,
        },
      });

      const transportDetails = await tx.transportDetails.create({
        data: {
          serviceId: service.id,
          origin: dto.origin,
          destination: dto.destination,
          seatClass: dto.seatClass,
        },
      });

      return { ...service, transportDetails };
    });
  }

  search(dto: TransportSearchDto): Promise<CatalogSearchResult> {
    const detailFilters: Prisma.TransportDetailsWhereInput = {};
    if (dto.origin) {
      detailFilters.origin = { contains: dto.origin, mode: 'insensitive' };
    }
    if (dto.destination) {
      detailFilters.destination = { contains: dto.destination, mode: 'insensitive' };
    }
    if (dto.seatClass) {
      detailFilters.seatClass = dto.seatClass;
    }

    const baseWhere: Prisma.ServiceWhereInput = {
      isActive: true,
      // `mode` narrows to one ServiceType; otherwise any of FLIGHT/TRAIN/BUS
      // qualifies -- inherited `location` from BaseCatalogSearchDto is
      // intentionally unused here in favor of origin/destination, which are
      // the fields that actually mean something for a transport leg.
      type: dto.mode ? dto.mode : { in: TRANSPORT_SERVICE_TYPES as unknown as ServiceType[] },
      ...(Object.keys(detailFilters).length && { transportDetails: detailFilters }),
    };

    return this.availabilitySearch.search({
      baseWhere,
      detailInclude: { transportDetails: true },
      startDate: dto.departureDate,
      endDate: dto.departureDate,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      sortBy: dto.sortBy,
      page: dto.page,
      limit: dto.limit,
    });
  }
}
