import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CatalogSearchResult } from '../catalog/availability-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTransportDto } from './dto/create-transport.dto';
import { TransportSearchDto } from './dto/transport-search.dto';
import { TransportService, TransportWithDetails } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // Public -- powers the Transport (flights/trains/buses) listing page.
  @Get('search')
  search(@Query() query: TransportSearchDto): Promise<CatalogSearchResult> {
    return this.transportService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateTransportDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TransportWithDetails> {
    return this.transportService.create(dto, user);
  }
}
