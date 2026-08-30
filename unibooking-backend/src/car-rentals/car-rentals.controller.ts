import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CatalogSearchResult } from '../catalog/availability-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CarRentalSearchDto } from './dto/car-rental-search.dto';
import { CreateCarRentalDto } from './dto/create-car-rental.dto';
import { CarRentalsService, CarRentalWithDetails } from './car-rentals.service';

@Controller('car-rentals')
export class CarRentalsController {
  constructor(private readonly carRentalsService: CarRentalsService) {}

  // Public -- powers the Car Rental listing page.
  @Get('search')
  search(@Query() query: CarRentalSearchDto): Promise<CatalogSearchResult> {
    return this.carRentalsService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateCarRentalDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CarRentalWithDetails> {
    return this.carRentalsService.create(dto, user);
  }
}
