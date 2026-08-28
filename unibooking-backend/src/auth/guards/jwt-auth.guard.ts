import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Delegates entirely to the 'jwt' Passport strategy (see JwtStrategy),
 * which pulls the token from the httpOnly cookie, verifies it, and
 * populates `request.user`. Apply with `@UseGuards(JwtAuthGuard)`.
 *
 * No constructor deps, so any module's controller can reference this class
 * directly without importing AuthModule -- Nest instantiates it on demand,
 * and the underlying 'jwt' strategy is already registered globally with
 * Passport as soon as AuthModule has loaded once (see app.module.ts).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
