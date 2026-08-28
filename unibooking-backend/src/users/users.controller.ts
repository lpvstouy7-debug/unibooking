import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type SafeUser = Omit<User, 'password_hash'>;

/**
 * Listing/looking up arbitrary users exposes emails, names, and phone
 * numbers -- ADMIN-only, not public. A user fetching their *own* profile
 * should go through `GET /auth/me` (JwtAuthGuard only, no DB hit) instead
 * of this controller.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => this.toSafeUser(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SafeUser> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toSafeUser(user);
  }

  private toSafeUser(user: User): SafeUser {
    const safeUser: Partial<User> = { ...user };
    delete safeUser.password_hash;
    return safeUser as SafeUser;
  }
}
