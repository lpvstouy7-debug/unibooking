import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CatalogSearchResult } from '../catalog/availability-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelSearchDto } from './dto/hotel-search.dto';
import { HotelsService, HotelWithDetails } from './hotels.service';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // Public -- powers the Hotels listing page, no auth required.
  @Get('search')
  search(@Query() query: HotelSearchDto): Promise<CatalogSearchResult> {
    return this.hotelsService.search(query);
  }

  // Supplier write path -- mirrors ServicesController.create()'s guard
  // shape (JwtAuthGuard + RolesGuard, SUPPLIER/ADMIN only).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateHotelDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<HotelWithDetails> {
    return this.hotelsService.create(dto, user);
  }
}
