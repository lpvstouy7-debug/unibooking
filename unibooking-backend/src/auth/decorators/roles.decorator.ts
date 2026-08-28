import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Marks a route/controller as restricted to the given Roles. Has no effect
 * on its own -- must be combined with RolesGuard (and JwtAuthGuard, which
 * must run first to populate `request.user`):
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.ADMIN)
 *   @Get()
 *   findAll() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
