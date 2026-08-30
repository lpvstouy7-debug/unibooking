import { Injectable } from '@nestjs/common';
import { CarRentalDetails, Prisma, Service, ServiceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilitySearchService,
  CatalogSearchResult,
} from '../catalog/availability-search.service';
import { SupplierOwnershipService } from '../catalog/supplier-ownership.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CarRentalSearchDto } from './dto/car-rental-search.dto';
import { CreateCarRentalDto } from './dto/create-car-rental.dto';

export type CarRentalWithDetails = Service & { carRentalDetails: CarRentalDetails };

@Injectable()
export class CarRentalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilitySearch: AvailabilitySearchService,
    private readonly supplierOwnership: SupplierOwnershipService,
  ) {}

  async create(dto: CreateCarRentalDto, user: JwtPayload): Promise<CarRentalWithDetails> {
    const supplierId = await this.supplierOwnership.resolveSupplierId(
      user,
      dto.supplierId,
    );

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          supplierId,
          type: ServiceType.CAR_RENTAL,
          name: dto.name,
          description: dto.description,
          location: dto.location,
        },
      });

      const carRentalDetails = await tx.carRentalDetails.create({
        data: {
          serviceId: service.id,
          vehicleType: dto.vehicleType,
          transmission: dto.transmission,
          seatingCapacity: dto.seatingCapacity,
        },
      });

      return { ...service, carRentalDetails };
    });
  }

  search(dto: CarRentalSearchDto): Promise<CatalogSearchResult> {
    const detailFilters: Prisma.CarRentalDetailsWhereInput = {};
    if (dto.vehicleType) {
      detailFilters.vehicleType = dto.vehicleType;
    }
    if (dto.transmission) {
      detailFilters.transmission = dto.transmission;
    }
    if (dto.minSeatingCapacity !== undefined) {
      detailFilters.seatingCapacity = { gte: dto.minSeatingCapacity };
    }

    const baseWhere: Prisma.ServiceWhereInput = {
      isActive: true,
      type: ServiceType.CAR_RENTAL,
      ...(dto.location && {
        location: { contains: dto.location, mode: 'insensitive' },
      }),
      ...(Object.keys(detailFilters).length && { carRentalDetails: detailFilters }),
    };

    return this.availabilitySearch.search({
      baseWhere,
      detailInclude: { carRentalDetails: true },
      startDate: dto.pickupDate,
      endDate: dto.returnDate,
      // dto.minPrice/maxPrice mean "daily rate" here -- there's no separate
      // dailyRate column (see CarRentalDetails in schema.prisma); it's
      // InventoryPricing.price for the pickup date, same mechanism hotels
      // use for nightly price.
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      sortBy: dto.sortBy,
      page: dto.page,
      limit: dto.limit,
    });
  }
}
