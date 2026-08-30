import { IsIn, IsUUID } from 'class-validator';
import { PAYMENT_METHODS, PaymentMethod } from '../gateways/payment-gateway.interface';

export class CreateCheckoutDto {
  @IsUUID()
  bookingId!: string;

  @IsIn(PAYMENT_METHODS)
  method!: PaymentMethod;
}
