import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  AdminService,
  AdminStats,
  PaginatedBookings,
  SafeUser,
} from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

// Applied once at the controller level, not per-handler -- a new endpoint
// added to this controller later can't accidentally ship without it.
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats(): Promise<AdminStats> {
    return this.adminService.getStats();
  }

  @Get('bookings')
  listBookings(
    @Query() query: ListBookingsQueryDto,
  ): Promise<PaginatedBookings> {
    return this.adminService.listBookings(query);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<SafeUser> {
    return this.adminService.updateUserRole(id, dto, admin);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<SafeUser> {
    return this.adminService.updateUserStatus(id, dto, admin);
  }
}
