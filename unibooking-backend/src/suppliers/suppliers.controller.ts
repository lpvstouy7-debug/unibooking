import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role, Supplier } from '@prisma/client';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ADMIN deliberately excluded -- a Supplier profile is always a self-service
  // onboarding step for the account's own SUPPLIER-role user, not something
  // an admin creates on someone else's behalf (see ServicesController for the
  // admin-on-behalf-of-a-supplier path, which happens after this exists).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @Post('profile')
  createProfile(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Supplier> {
    return this.suppliersService.createProfile(user, dto);
  }
}
