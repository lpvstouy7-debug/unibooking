import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { CheckoutSession, PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

/** `req.rawBody` is only populated when Nest is bootstrapped with `{ rawBody: true }` -- see main.ts. */
function requireRawBody(req: RawBodyRequest<Request>): Buffer {
  if (!req.rawBody) {
    throw new BadRequestException(
      'Raw request body was not captured -- is the app bootstrapped with rawBody: true?',
    );
  }
  return req.rawBody;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckoutSession(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CheckoutSession> {
    return this.paymentsService.createCheckoutSession(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:bookingId')
  getStatus(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ bookingStatus: BookingStatus; paymentStatus: PaymentStatus | null }> {
    return this.paymentsService.getPaymentStatus(bookingId, user);
  }

  /**
   * Deliberately unguarded -- called by Stripe server-to-server, not a
   * logged-in browser session. Authenticity comes from the
   * `Stripe-Signature` header verified inside StripeGateway.verifyWebhook
   * against the raw body, not from a JWT cookie.
   */
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    return this.paymentsService.handleGatewayWebhook(
      'STRIPE_CARD',
      requireRawBody(req),
      req.headers,
    );
  }

  /** Same as above, for whichever Lao QR provider LaoQrGateway ends up wired to -- see its file for what's still a placeholder. */
  @Post('webhook/lao')
  @HttpCode(HttpStatus.OK)
  handleLaoWebhook(
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    return this.paymentsService.handleGatewayWebhook(
      'LAO_QR_GATEWAY',
      requireRawBody(req),
      req.headers,
    );
  }
}
