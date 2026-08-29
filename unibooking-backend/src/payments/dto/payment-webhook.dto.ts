import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type WebhookStatus = 'succeeded' | 'failed';

/**
 * Mocks the shape of a real gateway's webhook payload. A real Stripe
 * integration replaces this DTO with `Stripe.Event` parsed from the raw
 * request body after signature verification (see the comment on
 * PaymentsController.handleWebhook) -- but the resolve-then-confirm logic
 * in PaymentsService.handleWebhook stays the same either way, which is the
 * point of keeping that logic in the service rather than the controller.
 */
export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsIn(['succeeded', 'failed'])
  status!: WebhookStatus;
}
