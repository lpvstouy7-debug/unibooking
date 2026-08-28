import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 config file: used only by the CLI (migrate, studio, db pull/push).
// The running NestJS app never reads this -- PrismaService builds its own
// driver adapter directly from process.env.DATABASE_URL at runtime.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
