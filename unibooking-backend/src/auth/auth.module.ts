import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Registers the 'jwt' strategy with Passport globally as a side effect
    // of JwtStrategy being instantiated below -- any controller anywhere in
    // the app can then use `@UseGuards(JwtAuthGuard)` without importing
    // AuthModule itself (see the comment on JwtAuthGuard).
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // jsonwebtoken types `expiresIn` as a branded "1d"/"2h"-style
          // string (via the `ms` package), not a plain `string` -- the env
          // var is validated at the infra level (.env.example), not by TS.
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') as NonNullable<
            JwtModuleOptions['signOptions']
          >['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  // RolesGuard exported for anyone who'd rather get it through DI than by
  // referencing the class directly in @UseGuards(...).
  exports: [RolesGuard],
})
export class AuthModule {}
