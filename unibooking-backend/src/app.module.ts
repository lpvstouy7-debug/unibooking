import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Loads .env once, application-wide. Every ConfigService.get() call below
    // (and in any future module) reads from this single source.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // Global PrismaClient -- see src/prisma/prisma.module.ts. Every other
    // module below (and Bookings/Payments/Inventory in later phases) injects
    // PrismaService directly without re-importing PrismaModule.
    PrismaModule,

    // Redis connection shared by every BullMQ queue registered anywhere in
    // the app (e.g. a future `BullModule.registerQueue('booking-expiry')`
    // inside BookingsModule, used to auto-cancel a PENDING Booking once
    // `expiresAt` passes). Configured dynamically via ConfigService so the
    // exact same code runs against local Redis, Docker, or a managed Redis
    // (ElastiCache/Upstash) in production -- only the .env changes.
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          // BullMQ's own requirement for the connection it uses for blocking
          // commands: without this, ioredis's default retry limit (20) can
          // permanently kill a worker's connection under sustained load.
          maxRetriesPerRequest: null,
        },
      }),
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registered via the APP_FILTER token (not app.useGlobalFilters in
    // main.ts) so the filter participates in Nest's DI graph and applies to
    // every controller in the app, including ones added by future modules.
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
