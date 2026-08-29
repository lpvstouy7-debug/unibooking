import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CheckoutSession, PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

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

  /**
   * Deliberately unguarded -- this is called by the payment gateway
   * server-to-server, not a logged-in browser session, so there's no JWT
   * cookie to check. A real integration verifies the gateway's request
   * signature here instead (e.g. Stripe's `Stripe-Signature` header
   * against the raw request body -- which needs a raw-body exception
   * carved out of the global JSON body parser for this one route). Not
   * implemented here since no real gateway/webhook secret is wired up yet;
   * treat this as the seam where that verification goes before this
   * endpoint ever reaches production traffic.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() dto: PaymentWebhookDto,
  ): Promise<{ received: boolean }> {
    return this.paymentsService.handleWebhook(dto);
  }
}
