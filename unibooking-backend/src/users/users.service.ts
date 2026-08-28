import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Data-access layer for User. Kept deliberately thin in this scaffolding
 * phase -- password hashing, role guards, and DTO validation land here once
 * AuthModule needs them in Phase 02.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Thin passthrough to Prisma -- callers are expected to have already
   * hashed `password_hash` (done in AuthModule, not here). Uniqueness on
   * `email` is enforced at the DB level; a duplicate throws P2002, which
   * PrismaClientExceptionFilter turns into a clean 409 automatically.
   */
  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
