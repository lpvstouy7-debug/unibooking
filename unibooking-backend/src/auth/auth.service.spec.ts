import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

// AuthService only ever calls bcrypt.compare (hashing itself happens in
// UsersService.create -- see users.service.spec.ts for that boundary).
// Mocked here so this suite tests AuthService's own branching logic, not
// bcrypt's real (deliberately slow) timing.
jest.mock('bcrypt');
const bcryptCompare = bcrypt.compare as unknown as jest.Mock;

const USER: User = {
  id: 'user-1',
  email: 'guest@example.com',
  password_hash: 'hashed-password',
  firstName: 'Somchai',
  lastName: 'Vongsa',
  phone: null,
  role: Role.CUSTOMER,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn(), create: jest.fn() };
    jwtService = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    bcryptCompare.mockReset();
  });

  describe('register', () => {
    const dto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('rejects when the email is already taken, without ever calling create()', async () => {
      usersService.findByEmail.mockResolvedValue(USER);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('creates the user and returns it without the password hash', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(USER);

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).not.toHaveProperty('password_hash');
      expect(result).toMatchObject({ id: USER.id, email: USER.email, role: USER.role });
    });
  });

  describe('validateUser', () => {
    it('rejects with a generic message when no user exists for the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('nobody@example.com', 'whatever')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcryptCompare).not.toHaveBeenCalled();
    });

    it('rejects with the SAME generic message when the password is wrong (no user-enumeration signal)', async () => {
      usersService.findByEmail.mockResolvedValue(USER);
      bcryptCompare.mockResolvedValue(false);

      const noUserError = await service
        .validateUser('nobody@example.com', 'whatever')
        .catch((e) => e);
      usersService.findByEmail.mockResolvedValue(USER);
      const wrongPasswordError = await service
        .validateUser(USER.email, 'wrong-password')
        .catch((e) => e);

      expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
      expect(wrongPasswordError.message).toBe(noUserError.message);
    });

    it('rejects a suspended user before comparing the password', async () => {
      usersService.findByEmail.mockResolvedValue({ ...USER, isActive: false });

      await expect(service.validateUser(USER.email, 'correct-password')).rejects.toThrow(
        ForbiddenException,
      );
      expect(bcryptCompare).not.toHaveBeenCalled();
    });

    it('returns the user (without password hash) when credentials are correct', async () => {
      usersService.findByEmail.mockResolvedValue(USER);
      bcryptCompare.mockResolvedValue(true);

      const result = await service.validateUser(USER.email, 'correct-password');

      expect(bcryptCompare).toHaveBeenCalledWith('correct-password', USER.password_hash);
      expect(result).not.toHaveProperty('password_hash');
      expect(result.id).toBe(USER.id);
    });
  });

  describe('issueToken', () => {
    it('signs a JWT containing exactly sub/email/role', async () => {
      jwtService.signAsync.mockResolvedValue('signed.jwt.token');

      const token = await service.issueToken({
        id: USER.id,
        email: USER.email,
        firstName: USER.firstName,
        lastName: USER.lastName,
        phone: USER.phone,
        role: USER.role,
        isActive: USER.isActive,
        createdAt: USER.createdAt,
        updatedAt: USER.updatedAt,
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: USER.id,
        email: USER.email,
        role: USER.role,
      });
      expect(token).toBe('signed.jwt.token');
    });
  });
});
