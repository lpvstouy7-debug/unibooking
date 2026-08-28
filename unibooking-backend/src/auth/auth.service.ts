import { Injectable, NotImplementedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/**
 * Scaffolding only (Phase 01). Wired up now so AuthModule/UsersModule DI is
 * proven end-to-end; real credential verification + JWT issuance
 * (bcrypt/argon2 hashing, @nestjs/jwt, Passport strategies, refresh tokens)
 * lands in Phase 02.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // `password` is accepted now (not yet compared) so the public signature
  // already matches Phase 02, where it's verified against password_hash
  // via bcrypt/argon2.
  validateUser(email: string, password: string): Promise<never> {
    void password;
    return Promise.reject(
      new NotImplementedException(
        `Credential validation for "${email}" lands in Phase 02`,
      ),
    );
  }

  login(email: string, password: string): Promise<never> {
    void password;
    return Promise.reject(
      new NotImplementedException(
        `JWT issuance for "${email}" lands in Phase 02`,
      ),
    );
  }
}
