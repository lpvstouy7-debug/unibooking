import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CatalogSearchResult } from '../catalog/availability-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourSearchDto } from './dto/tour-search.dto';
import { ToursService, TourWithDetails } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // Public -- powers the Tours listing page.
  @Get('search')
  search(@Query() query: TourSearchDto): Promise<CatalogSearchResult> {
    return this.toursService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateTourDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TourWithDetails> {
    return this.toursService.create(dto, user);
  }
}
