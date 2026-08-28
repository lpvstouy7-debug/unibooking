import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

export type SafeUser = Omit<User, 'password_hash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Checked here (not left to the DB's unique constraint alone) so
   * "email taken" fails before a hash is even computed -- bcrypt is
   * deliberately slow, so skipping it on a guaranteed-to-fail request
   * matters under load. The P2002 path via PrismaClientExceptionFilter
   * still exists as a safety net for the race between this check and the
   * insert.
   */
  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const user = await this.usersService.create(dto);
    return this.toSafeUser(user);
  }

  /**
   * Deliberately returns the *same* generic message whether the email
   * doesn't exist or the password is wrong -- distinguishing the two lets
   * an attacker enumerate registered emails.
   */
  async validateUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.toSafeUser(user);
  }

  issueToken(user: SafeUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  private toSafeUser(user: User): SafeUser {
    const safeUser: Partial<User> = { ...user };
    delete safeUser.password_hash;
    return safeUser as SafeUser;
  }
}
