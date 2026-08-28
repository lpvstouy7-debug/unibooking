import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

// Cost factor for bcrypt's hashing rounds. 12 is the current common
// baseline (~250ms/hash on modern hardware) -- high enough to resist
// offline brute-force, low enough to not bottleneck login/register.
const BCRYPT_SALT_ROUNDS = 12;

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
   * The only place a User row is ever written from plaintext input --
   * hashes `dto.password` with bcrypt before it touches Prisma/Postgres, so
   * the raw password never reaches a query, a log line, or the database.
   * `role` isn't accepted here; every user created this way gets the
   * schema's CUSTOMER default (see RegisterDto for why).
   * Email uniqueness is enforced at the DB level -- a duplicate throws
   * P2002, which PrismaClientExceptionFilter turns into a clean 409.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const password_hash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });
  }
}
