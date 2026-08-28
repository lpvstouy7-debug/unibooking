import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { ACCESS_TOKEN_COOKIE } from '../constants';

/** Shape of the JWT payload -- also what `request.user` becomes post-guard. */
export interface JwtPayload {
  sub: string; // User.id
  email: string;
  role: Role;
}

/**
 * passport-jwt's built-in extractors all read the `Authorization` header;
 * our frontend uses `credentials: 'include'` cookies instead, so we supply
 * our own extractor that reads the httpOnly cookie AuthController sets.
 */
function cookieExtractor(req: Request): string | null {
  const token = req?.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  return token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Runs only after the JWT's signature and expiry have already been
   * verified by passport-jwt. Whatever this returns becomes `request.user`
   * for every downstream guard/handler (see RolesGuard, CurrentUser).
   *
   * Deliberately NOT re-querying the database here -- the payload already
   * carries id/email/role, and a hot DB lookup on every guarded request
   * would be a needless bottleneck. The tradeoff: a role change or a
   * disabled account doesn't take effect until the existing token expires.
   * If that ever becomes unacceptable, add a token-revocation/short-TTL
   * strategy rather than reintroducing a per-request DB hit here.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
