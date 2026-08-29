import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Supplier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Turns a CUSTOMER/SUPPLIER-role account into a fully onboarded supplier
   * by attaching the one Supplier row a User can own (Supplier.userId is
   * @unique in schema.prisma). Two checks run before the insert, in this
   * order:
   *
   *  1. The user still exists -- `user.sub` comes from a JWT that could
   *     have been issued before the account was deleted (JwtStrategy
   *     deliberately doesn't hit the DB on every request; see its comment).
   *  2. No Supplier profile already exists for this user -- checked
   *     explicitly (not left to the DB alone) so a duplicate attempt fails
   *     fast with a clear message instead of a raw constraint error. The
   *     P2002 path via PrismaClientExceptionFilter still exists as a
   *     safety net for the race between this check and the insert.
   */
  async createProfile(
    user: JwtPayload,
    dto: CreateSupplierDto,
  ): Promise<Supplier> {
    const existingUser = await this.usersService.findById(user.sub);
    if (!existingUser) {
      throw new NotFoundException('User account not found.');
    }

    const existingSupplier = await this.prisma.supplier.findUnique({
      where: { userId: user.sub },
    });
    if (existingSupplier) {
      throw new ConflictException(
        'A supplier profile already exists for this account.',
      );
    }

    return this.prisma.supplier.create({
      data: {
        userId: user.sub,
        companyName: dto.companyName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        taxId: dto.taxId,
      },
    });
  }
}
