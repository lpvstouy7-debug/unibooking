import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPrismaMock,
  MockPrisma,
  resetPrismaMock,
} from '../test-utils/prisma-mock';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

// Deliberately uses the REAL bcrypt module (not jest.mock('bcrypt')) --
// this is the one place in the app responsible for turning a plaintext
// password into a hash (see the class comment on UsersService.create), so
// it's the boundary worth verifying actually hashes/salts correctly rather
// than mocking past. AuthService's own tests mock bcrypt.compare instead,
// since that suite is about AuthService's branching, not hashing itself.

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: MockPrisma;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => {
    resetPrismaMock(prismaMock);
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'guest@example.com',
      password: 'super-secret-password',
      firstName: 'Somchai',
      lastName: 'Vongsa',
    };

    // The mocked return value below is intentionally NOT derived from
    // whatever `data` the service passes in -- every assertion reads the
    // actual call argument via `prismaMock.user.create.mock.calls[0][0]`,
    // so the resolved value only needs to satisfy UsersService.create()'s
    // own return type (a plain User), not Prisma's fluent client shape.
    const RESOLVED_USER = {
      id: 'user-1',
      email: dto.email,
      password_hash: 'irrelevant-here',
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: null,
      role: Role.CUSTOMER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('hashes the password with bcrypt before writing to Prisma, and never stores the plaintext', async () => {
      prismaMock.user.create.mockResolvedValue(RESOLVED_USER as never);

      await service.create(dto);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      const writtenData = prismaMock.user.create.mock.calls[0][0].data;

      expect(writtenData.password_hash).toBeDefined();
      expect(writtenData.password_hash).not.toBe(dto.password);
      expect(writtenData).not.toHaveProperty('password');

      // Confirms it's a real, correctly-salted bcrypt hash -- not just "some
      // different string" -- by round-tripping it through bcrypt.compare.
      const matches = await bcrypt.compare(dto.password, writtenData.password_hash);
      expect(matches).toBe(true);

      const wrongPasswordMatches = await bcrypt.compare('not-the-password', writtenData.password_hash);
      expect(wrongPasswordMatches).toBe(false);
    });

    it('passes email/firstName/lastName/phone through unchanged', async () => {
      prismaMock.user.create.mockResolvedValue(RESOLVED_USER as never);

      await service.create({ ...dto, phone: '+8562012345678' });

      const writtenData = prismaMock.user.create.mock.calls[0][0].data;
      expect(writtenData.email).toBe(dto.email);
      expect(writtenData.firstName).toBe(dto.firstName);
      expect(writtenData.lastName).toBe(dto.lastName);
      expect(writtenData.phone).toBe('+8562012345678');
    });
  });

  describe('findByEmail', () => {
    it('looks up by the email unique constraint', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await service.findByEmail('guest@example.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'guest@example.com' },
      });
    });
  });
});
