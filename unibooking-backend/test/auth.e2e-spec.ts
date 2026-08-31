import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
// Default import (not `import * as cookieParser`, unlike src/main.ts) --
// this test file's ts-jest transform runs with esModuleInterop: true (see
// package.json/test/jest-e2e.json's jest.transform), specifically to load
// @nestjs/jwt's ESM build, and that flips which import form is callable.
import cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '@prisma/client';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import {
  createPrismaMock,
  MockPrisma,
  resetPrismaMock,
} from '../src/test-utils/prisma-mock';

// Deterministic secret for this suite, set before the module compiles so
// AuthModule's JwtModule.registerAsync and JwtStrategy (both read it via
// ConfigService) see the same value. Paired with `ignoreEnvFile: true`
// below, this suite never reads or needs the real unibooking-backend/.env.
process.env.JWT_SECRET = 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

/**
 * Deliberately imports only AuthModule (plus a bare ConfigModule and the
 * same PrismaClientExceptionFilter/ValidationPipe/cookie-parser main.ts
 * wires globally) rather than the full AppModule -- this is a true HTTP-
 * layer test of routing/DTO-validation/guards for the Auth surface, without
 * pulling in BullMQ/Redis/Prometheus/every other module's concerns. See
 * bookings.e2e-spec.ts for the equivalent covering a Role-guarded route.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: MockPrisma;

  const REGISTER_BODY = {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User',
  };

  const KNOWN_PASSWORD = 'correct-password';
  const KNOWN_PASSWORD_HASH = bcrypt.hashSync(KNOWN_PASSWORD, 10);
  const EXISTING_USER = {
    id: 'user-2',
    email: 'guest@example.com',
    password_hash: KNOWN_PASSWORD_HASH,
    firstName: 'Somchai',
    lastName: 'Vongsa',
    phone: null,
    role: Role.CUSTOMER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PrismaModule,
        AuthModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: PrismaClientExceptionFilter }],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterEach(() => {
    resetPrismaMock(prismaMock);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('creates the user, sets the httpOnly auth cookie, and never echoes the password hash', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null); // no existing user with this email
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: REGISTER_BODY.email,
        password_hash: 'irrelevant-in-this-test',
        firstName: REGISTER_BODY.firstName,
        lastName: REGISTER_BODY.lastName,
        phone: null,
        role: Role.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(REGISTER_BODY)
        .expect(201);

      expect(res.body.user.email).toBe(REGISTER_BODY.email);
      expect(res.body.user).not.toHaveProperty('password_hash');
      expect(res.headers['set-cookie']?.[0]).toMatch(/^access_token=.+; Path=\/;.*HttpOnly/i);
    });

    it('rejects a payload missing required fields (class-validator DTO validation) with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'no-password@example.com' })
        .expect(400);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rejects a payload carrying a field the DTO does not declare (forbidNonWhitelisted)', async () => {
      // RegisterDto deliberately has no `role` field -- see its own comment
      // on why letting a client self-assign a Role would be a privilege
      // escalation. This 400 is what actually enforces that at the wire level.
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...REGISTER_BODY, role: 'ADMIN' })
        .expect(400);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate email with 409', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' } as never);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(REGISTER_BODY)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with correct credentials and sets the auth cookie', async () => {
      prismaMock.user.findUnique.mockResolvedValue(EXISTING_USER as never);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: EXISTING_USER.email, password: KNOWN_PASSWORD })
        .expect(200);

      expect(res.body.user.email).toBe(EXISTING_USER.email);
      expect(res.headers['set-cookie']?.[0]).toMatch(/^access_token=/);
    });

    it('rejects an incorrect password with 401', async () => {
      prismaMock.user.findUnique.mockResolvedValue(EXISTING_USER as never);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: EXISTING_USER.email, password: 'wrong-password' })
        .expect(401);
    });

    it('rejects a missing password field with 400 before ever touching the database', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: EXISTING_USER.email })
        .expect(400);

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('GET /auth/me', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns the JWT payload for a request carrying a valid session cookie from a real login', async () => {
      prismaMock.user.findUnique.mockResolvedValue(EXISTING_USER as never);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: EXISTING_USER.email, password: KNOWN_PASSWORD })
        .expect(200);

      const cookie = loginRes.headers['set-cookie'];

      const meRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(meRes.body).toMatchObject({
        sub: EXISTING_USER.id,
        email: EXISTING_USER.email,
        role: EXISTING_USER.role,
      });
    });
  });
});
