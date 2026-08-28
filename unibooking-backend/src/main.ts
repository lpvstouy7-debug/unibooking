import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ties Prisma's connection pool to Nest's own shutdown lifecycle -- see
  // the comment on PrismaService.enableShutdownHooks for why this matters
  // under a container orchestrator's SIGTERM during a rolling deploy.
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
