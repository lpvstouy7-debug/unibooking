import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// Default import -- see the comment in test/auth.e2e-spec.ts on why this
// differs from src/main.ts's namespace-style import.
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { Prisma, Role } from '@prisma/client';
import { AuthModule } from '../src/auth/auth.module';
import { BookingsModule } from '../src/bookings/bookings.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import {
  createPrismaMock,
  mockPrismaTransactions,
  MockPrisma,
  resetPrismaMock,
} from '../src/test-utils/prisma-mock';

process.env.JWT_SECRET = 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

/**
 * AuthModule is imported alongside BookingsModule for one reason only:
 * instantiating it is what registers the 'jwt' Passport strategy that
 * JwtAuthGuard (used here via BookingsController) delegates to -- see the
 * comment on JwtAuthGuard itself. AuthController's own routes aren't
 * exercised in this file at all (that's auth.e2e-spec.ts); tokens here are
 * minted directly via JwtService so this suite stays focused on
 * BookingsController's routing/DTO-validation/guard behavior.
 */
describe('Bookings (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: MockPrisma;
  let jwtService: JwtService;

  // A real, RFC4122-valid UUID -- @IsUUID() rejects an arbitrary "looks like
  // a UUID" string (e.g. all-1s) if its variant nibble isn't 8/9/a/b.
  const SERVICE_ID = '123e4567-e89b-12d3-a456-426614174000';

  function tokenFor(role: Role, sub = 'user-1'): Promise<string> {
    return jwtService.signAsync({ sub, email: `${sub}@example.com`, role });
  }

  beforeAll(async () => {
    prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PrismaModule,
        AuthModule,
        BookingsModule,
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

    jwtService = moduleFixture.get(JwtService);
  });

  // $transaction wiring is lost on mockReset(), so re-apply it every time
  // -- see the comment on mockPrismaTransactions in prisma-mock.ts.
  beforeEach(() => {
    resetPrismaMock(prismaMock);
    mockPrismaTransactions(prismaMock);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /bookings', () => {
    const validBody = {
      serviceId: SERVICE_ID,
      startDate: '2026-02-01',
      endDate: '2026-02-03',
      units: 1,
    };

    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).post('/bookings').send(validBody).expect(401);
    });

    it('rejects an invalid DTO (bad UUID, non-positive units) with 400', async () => {
      const token = await tokenFor(Role.CUSTOMER);

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Cookie', `access_token=${token}`)
        .send({ ...validBody, serviceId: 'not-a-uuid', units: 0 })
        .expect(400);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('creates a booking for an authenticated customer when inventory is available', async () => {
      const token = await tokenFor(Role.CUSTOMER, 'customer-1');

      prismaMock.inventoryPricing.findMany.mockResolvedValue([
        { id: 'inv-1', serviceId: SERVICE_ID, date: new Date('2026-02-01'), availableUnits: 5, price: new Prisma.Decimal(200000), createdAt: new Date(), updatedAt: new Date() },
        { id: 'inv-2', serviceId: SERVICE_ID, date: new Date('2026-02-02'), availableUnits: 5, price: new Prisma.Decimal(200000), createdAt: new Date(), updatedAt: new Date() },
      ]);
      prismaMock.inventoryPricing.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.booking.create.mockResolvedValue({
        id: 'booking-1',
        bookingReference: 'BK-ABCD1234',
        userId: 'customer-1',
        status: 'PENDING',
        totalPrice: 400000,
        items: [],
      } as never);

      const res = await request(app.getHttpServer())
        .post('/bookings')
        .set('Cookie', `access_token=${token}`)
        .send(validBody)
        .expect(201);

      expect(res.body.bookingReference).toBe('BK-ABCD1234');
      expect(res.body.status).toBe('PENDING');

      const createArg = prismaMock.booking.create.mock.calls[0][0];
      expect(createArg.data.userId).toBe('customer-1');
    });

    it('returns 400 when a night in the range has no availability', async () => {
      const token = await tokenFor(Role.CUSTOMER, 'customer-1');
      prismaMock.inventoryPricing.findMany.mockResolvedValue([]); // nothing configured for either night

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Cookie', `access_token=${token}`)
        .send(validBody)
        .expect(400);

      expect(prismaMock.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /bookings/supplier (Role Guard)', () => {
    it('rejects a CUSTOMER-role token with 403, without ever querying for a supplier profile', async () => {
      const token = await tokenFor(Role.CUSTOMER);

      await request(app.getHttpServer())
        .get('/bookings/supplier')
        .set('Cookie', `access_token=${token}`)
        .expect(403);

      expect(prismaMock.supplier.findUnique).not.toHaveBeenCalled();
    });

    it('rejects an unauthenticated request with 401 (guard order: JwtAuthGuard before RolesGuard)', async () => {
      await request(app.getHttpServer()).get('/bookings/supplier').expect(401);
    });

    it('allows a SUPPLIER-role token through and scopes results to their own services', async () => {
      const token = await tokenFor(Role.SUPPLIER, 'supplier-user-1');
      prismaMock.supplier.findUnique.mockResolvedValue({ id: 'supplier-1' } as never);
      prismaMock.booking.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/bookings/supplier')
        .set('Cookie', `access_token=${token}`)
        .expect(200);

      expect(prismaMock.supplier.findUnique).toHaveBeenCalledWith({
        where: { userId: 'supplier-user-1' },
      });
    });
  });
});
