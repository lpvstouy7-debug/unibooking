import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, SafeUser } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
} from './constants';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Registration also logs the new user in (sets the cookie) so the
  // frontend doesn't need a separate login round-trip right after sign-up.
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: SafeUser }> {
    const user = await this.authService.register(dto);
    await this.setAuthCookie(res, user);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: SafeUser }> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    await this.setAuthCookie(res, user);
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    // Options here must mirror what `res.cookie(...)` was set with
    // (path in particular) or the browser won't match/clear the cookie.
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    return { message: 'Logged out successfully.' };
  }

  // Minimal end-to-end proof that JwtAuthGuard + the cookie round-trip
  // actually work: returns exactly what's in the verified JWT, no DB hit.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }

  private async setAuthCookie(res: Response, user: SafeUser): Promise<void> {
    const token = await this.authService.issueToken(user);

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true, // inaccessible to client-side JS -- the whole point, XSS mitigation
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod; plain HTTP in local dev
      sameSite: 'lax', // sent on top-level navigation/same-site XHR, blocks basic CSRF vectors
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      path: '/',
    });
  }
}
