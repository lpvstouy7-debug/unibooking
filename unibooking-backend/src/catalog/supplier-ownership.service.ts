import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

/**
 * Shared by every vertical's create-service flow (Hotels/Transport/Tours/
 * CarRentals) -- same rule ServicesService.create() already enforces
 * inline for the generic POST /services: a SUPPLIER always creates a
 * listing under their own profile, resolved from the JWT.
 * `requestedSupplierId` is only honoured for ADMIN (onboarding a listing on
 * a supplier's behalf); a SUPPLIER caller can't use it to list under
 * someone else's account.
 *
 * Not wired into ServicesService.create() itself -- that already works and
 * duplicating this logic there carries no behavior change, only a refactor
 * risk with no live DB here to verify against. New verticals use this
 * directly; ServicesService can be pointed at it later.
 */
@Injectable()
export class SupplierOwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveSupplierId(
    user: JwtPayload,
    requestedSupplierId?: string,
  ): Promise<string> {
    if (user.role === Role.ADMIN && requestedSupplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: requestedSupplierId },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with id "${requestedSupplierId}" not found.`,
        );
      }
      return supplier.id;
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { userId: user.sub },
    });
    if (!supplier) {
      throw new NotFoundException(
        'No supplier profile found for this account. Complete your supplier profile before listing services.',
      );
    }
    return supplier.id;
  }
}
