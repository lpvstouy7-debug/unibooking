import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Thin wrapper around the generated PrismaClient that plugs into Nest's
 * module lifecycle so the connection pool opens once on boot and closes
 * cleanly on shutdown, instead of every consumer managing its own client.
 *
 * Inject this anywhere via constructor DI:
 *   constructor(private readonly prisma: PrismaService) {}
 *   this.prisma.user.findMany(...)
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Fail at construction time (app boot), not on the first query.
      throw new Error('DATABASE_URL is not set -- check your .env file.');
    }

    // Prisma 7 removed `datasource.url` support from schema.prisma; the
    // client now always connects through an explicit driver adapter. This
    // is also what makes swapping to e.g. @prisma/adapter-neon for a
    // serverless/edge deployment later a one-line change, isolated here.
    const adapter = new PrismaPg(connectionString);

    super({
      adapter,
      // Verbose SQL logging in dev only -- keep production logs to warnings/errors.
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  /**
   * Connect eagerly on application boot rather than lazily on the first
   * query, so a misconfigured DATABASE_URL fails fast at startup instead of
   * surfacing as a confusing 500 on the first request in production.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from PostgreSQL');
  }

  /**
   * Prisma's process-level `beforeExit` hook fires before Nest's own
   * SIGTERM/SIGINT handlers do, so without this, a container orchestrator
   * (Kubernetes, ECS) sending SIGTERM can kill the DB connection mid-request
   * during a rolling deploy. Call once from main.ts:
   *   prismaService.enableShutdownHooks(app);
   */
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
