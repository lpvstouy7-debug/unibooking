import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryPricing, Role, Service } from '@prisma/client';
import { ServicesService, SearchResult } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { AddInventoryDto } from './dto/add-inventory.dto';
import { SearchServicesQueryDto } from './dto/search-services-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Public -- powers the storefront's search/listing page, no auth required.
  @Get('search')
  search(@Query() query: SearchServicesQueryDto): Promise<SearchResult> {
    return this.servicesService.search(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Service> {
    return this.servicesService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @Post(':id/inventory')
  addInventory(
    @Param('id', ParseUUIDPipe) serviceId: string,
    @Body() dto: AddInventoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<InventoryPricing[]> {
    return this.servicesService.addInventory(serviceId, dto, user);
  }
}
