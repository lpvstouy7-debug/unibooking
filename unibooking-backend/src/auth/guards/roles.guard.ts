import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '../strategies/jwt.strategy';

/**
 * Enforces the roles set by @Roles(...) against `request.user.role`.
 *
 * MUST run after JwtAuthGuard has populated `request.user` --
 * `@UseGuards(JwtAuthGuard, RolesGuard)`, in that order. Guards execute
 * left-to-right, so RolesGuard would otherwise see an empty `request.user`.
 *
 * Only depends on Reflector, which Nest's core always provides, so -- like
 * JwtAuthGuard -- any module's controller can reference this class directly
 * without importing AuthModule.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator on this route -- open to any authenticated user.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
