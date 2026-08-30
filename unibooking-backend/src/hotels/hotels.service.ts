import { Injectable } from '@nestjs/common';
import { HotelDetails, Prisma, Service, ServiceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilitySearchService,
  CatalogSearchResult,
} from '../catalog/availability-search.service';
import { SupplierOwnershipService } from '../catalog/supplier-ownership.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelSearchDto } from './dto/hotel-search.dto';

export type HotelWithDetails = Service & { hotelDetails: HotelDetails };

@Injectable()
export class HotelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilitySearch: AvailabilitySearchService,
    private readonly supplierOwnership: SupplierOwnershipService,
  ) {}

  /**
   * Atomically creates the parent Service row and its HotelDetails child --
   * both or neither, so a HotelDetails insert failure (e.g. a future DB
   * constraint) can never leave a HOTEL-typed Service with no details row,
   * which is exactly the "search returns it but with nothing to show" bug
   * this whole vertical exists to avoid.
   */
  async create(dto: CreateHotelDto, user: JwtPayload): Promise<HotelWithDetails> {
    const supplierId = await this.supplierOwnership.resolveSupplierId(
      user,
      dto.supplierId,
    );

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          supplierId,
          type: ServiceType.HOTEL,
          name: dto.name,
          description: dto.description,
          location: dto.location,
        },
      });

      const hotelDetails = await tx.hotelDetails.create({
        data: {
          serviceId: service.id,
          starRating: dto.starRating,
          propertyType: dto.propertyType,
          amenities: dto.amenities ?? [],
        },
      });

      return { ...service, hotelDetails };
    });
  }

  search(dto: HotelSearchDto): Promise<CatalogSearchResult> {
    const detailFilters: Prisma.HotelDetailsWhereInput = {};
    if (dto.starRating !== undefined) {
      detailFilters.starRating = { gte: dto.starRating };
    }
    if (dto.propertyType) {
      detailFilters.propertyType = dto.propertyType;
    }
    if (dto.amenities?.length) {
      detailFilters.amenities = { hasEvery: dto.amenities };
    }

    const baseWhere: Prisma.ServiceWhereInput = {
      isActive: true,
      type: ServiceType.HOTEL,
      ...(dto.location && {
        location: { contains: dto.location, mode: 'insensitive' },
      }),
      ...(Object.keys(detailFilters).length && { hotelDetails: detailFilters }),
    };

    return this.availabilitySearch.search({
      baseWhere,
      detailInclude: { hotelDetails: true },
      startDate: dto.checkInDate,
      endDate: dto.checkOutDate,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      sortBy: dto.sortBy,
      page: dto.page,
      limit: dto.limit,
    });
  }
}
