import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';

export type MockPrisma = DeepMockProxy<PrismaService>;

/**
 * A deep, type-safe mock of PrismaService (which `extends PrismaClient`,
 * see src/prisma/prisma.service.ts) -- `prismaMock.user.findUnique`,
 * `prismaMock.booking.create`, etc. are all real jest.fn()s, so no test
 * needs a live PostgreSQL connection.
 *
 * Never construct a real `PrismaService` in tests: its constructor throws
 * if `DATABASE_URL` isn't set and immediately opens a real `pg` adapter.
 * That's never an issue here because tests use
 * `.overrideProvider(PrismaService).useValue(createPrismaMock())` on the
 * Nest TestingModuleBuilder -- Nest's DI container then never calls `new
 * PrismaService()` at all, real or otherwise.
 */
export function createPrismaMock(): MockPrisma {
  return mockDeep<PrismaService>();
}

/**
 * BookingsService, ReviewsService, and AvailabilitySearchService all call
 * `prisma.$transaction(...)`, in whichever of the two shapes Prisma
 * supports fits the case:
 *   - interactive: `$transaction(async (tx) => { ...tx.model.op()... })`
 *   - sequential:  `$transaction([prisma.a.op(), prisma.b.op()])`
 * A deep mock doesn't know how to resolve either on its own. This wires
 * `$transaction` so both forms work against the SAME mock: the interactive
 * callback is invoked with `prismaMock` itself as `tx`, so
 * `tx.inventoryPricing.findMany` IS `prismaMock.inventoryPricing.findMany`
 * -- mock the delegate once, either transaction form sees it. The array
 * form just resolves via `Promise.all`.
 *
 * Call this once per test (or in `beforeEach`) after `createPrismaMock()`.
 */
export function mockPrismaTransactions(prismaMock: MockPrisma): void {
  prismaMock.$transaction.mockImplementation(((arg: unknown) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === 'function') {
      return (arg as (tx: MockPrisma) => unknown)(prismaMock);
    }
    throw new Error(
      `Unsupported $transaction argument in test mock: ${typeof arg}`,
    );
  }) as unknown as MockPrisma['$transaction']);
}

/** Call in `afterEach` so mock calls/return values from one test never leak into the next. */
export function resetPrismaMock(prismaMock: MockPrisma): void {
  mockReset(prismaMock);
}
