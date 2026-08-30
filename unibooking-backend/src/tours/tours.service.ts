import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Service, ServiceType, TourDetails } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilitySearchService,
  CatalogSearchResult,
} from '../catalog/availability-search.service';
import { SupplierOwnershipService } from '../catalog/supplier-ownership.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourSearchDto } from './dto/tour-search.dto';

export type TourWithDetails = Service & { tourDetails: TourDetails };

@Injectable()
export class ToursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilitySearch: AvailabilitySearchService,
    private readonly supplierOwnership: SupplierOwnershipService,
  ) {}

  async create(dto: CreateTourDto, user: JwtPayload): Promise<TourWithDetails> {
    if (dto.maxGroupSize < dto.minGroupSize) {
      throw new BadRequestException(
        'maxGroupSize must be greater than or equal to minGroupSize.',
      );
    }

    const supplierId = await this.supplierOwnership.resolveSupplierId(
      user,
      dto.supplierId,
    );

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          supplierId,
          type: ServiceType.TOUR,
          name: dto.name,
          description: dto.description,
          location: dto.location,
        },
      });

      const tourDetails = await tx.tourDetails.create({
        data: {
          serviceId: service.id,
          durationDays: dto.durationDays,
          category: dto.category,
          difficulty: dto.difficulty,
          minGroupSize: dto.minGroupSize,
          maxGroupSize: dto.maxGroupSize,
        },
      });

      return { ...service, tourDetails };
    });
  }

  search(dto: TourSearchDto): Promise<CatalogSearchResult> {
    const detailFilters: Prisma.TourDetailsWhereInput = {};

    if (dto.minDurationDays !== undefined || dto.maxDurationDays !== undefined) {
      detailFilters.durationDays = {
        ...(dto.minDurationDays !== undefined && { gte: dto.minDurationDays }),
        ...(dto.maxDurationDays !== undefined && { lte: dto.maxDurationDays }),
      };
    }
    if (dto.category) {
      detailFilters.category = { equals: dto.category, mode: 'insensitive' };
    }
    if (dto.difficulty) {
      detailFilters.difficulty = dto.difficulty;
    }
    if (dto.groupSize !== undefined) {
      // Both conditions target the same TourDetails row -- Prisma ANDs
      // sibling fields within one relation filter object automatically.
      detailFilters.minGroupSize = { lte: dto.groupSize };
      detailFilters.maxGroupSize = { gte: dto.groupSize };
    }

    const baseWhere: Prisma.ServiceWhereInput = {
      isActive: true,
      type: ServiceType.TOUR,
      ...(dto.location && {
        location: { contains: dto.location, mode: 'insensitive' },
      }),
      ...(Object.keys(detailFilters).length && { tourDetails: detailFilters }),
    };

    return this.availabilitySearch.search({
      baseWhere,
      detailInclude: { tourDetails: true },
      startDate: dto.startDate,
      endDate: dto.startDate,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      sortBy: dto.sortBy,
      page: dto.page,
      limit: dto.limit,
    });
  }
}
