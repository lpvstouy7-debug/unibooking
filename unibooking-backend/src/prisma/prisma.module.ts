import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * `@Global()` because almost every feature module (Users, Auth, Bookings,
 * Inventory, Payments...) needs the same single PrismaClient / connection
 * pool. Marking it global means only AppModule imports PrismaModule once --
 * every other module just injects PrismaService without re-importing it.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
