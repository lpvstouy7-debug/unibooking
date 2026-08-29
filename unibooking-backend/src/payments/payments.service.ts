import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

const MOCK_GATEWAY_BASE_URL = 'https://mock-gateway.unibooking.dev/checkout';
const PAYMENT_METHOD = 'MOCK_GATEWAY';

export interface CheckoutSession {
  checkoutUrl: string;
  transactionId: string;
  bookingId: string;
  amount: number;
}

function generateTransactionId(): string {
  return `TXN-${randomBytes(8).toString('hex').toUpperCase()}`;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates (or re-creates, on a retried checkout) a mock gateway session
   * for a booking. Structurally this is exactly the shape a real
   * integration takes: create/reuse a Payment row, hand the caller a
   * checkoutUrl + transactionId minted by the gateway. Swapping the mock
   * URL/id generation below for `stripe.checkout.sessions.create()` is the
   * only change a real Stripe integration needs here.
   */
  async createCheckoutSession(
    dto: CreateCheckoutDto,
    user: JwtPayload,
  ): Promise<CheckoutSession> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with id "${dto.bookingId}" not found.`,
      );
    }
    if (booking.userId !== user.sub) {
      throw new ForbiddenException('This booking does not belong to you.');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking is ${booking.status.toLowerCase()} and can no longer be paid for.`,
      );
    }
    if (booking.expiresAt <= new Date()) {
      throw new BadRequestException(
        "This booking's hold has expired -- please create a new booking.",
      );
    }

    const transactionId = generateTransactionId();

    // upsert, not create: a customer re-opening an abandoned checkout hits
    // the same Payment row (bookingId is @unique on Payment) instead of a
    // P2002 unique-constraint error on a second attempt.
    await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        transactionId,
        amount: booking.totalPrice,
        method: PAYMENT_METHOD,
        status: PaymentStatus.PENDING,
      },
      update: {
        transactionId,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      checkoutUrl: `${MOCK_GATEWAY_BASE_URL}/${transactionId}`,
      transactionId,
      bookingId: booking.id,
      amount: Number(booking.totalPrice),
    };
  }

  /**
   * The webhook is the one place a payment becomes real, and it runs
   * completely independently of the Phase 04.5 cron sweep -- so the two
   * can race for the same row. The conditional `updateMany` below IS the
   * guard: Postgres serializes concurrent writes to the same booking row,
   * so this can only confirm a booking the cron hasn't already cancelled a
   * moment earlier.
   *
   * When it affects 0 rows, two genuinely different situations look
   * identical from the update alone, so a follow-up read distinguishes
   * them:
   *  - booking already CONFIRMED -> a duplicate webhook delivery (gateways
   *    retry by design) -- idempotent no-op, not an error.
   *  - booking CANCELLED (or anything else non-PENDING) -> the cron won
   *    the race and already released this booking's inventory. Money has
   *    now arrived for a slot that may belong to someone else's booking.
   *    Re-confirming here would risk a second, silent double-booking on
   *    top of the first race, so this deliberately does NOT flip the
   *    booking back -- it's logged as a critical, actionable error for
   *    manual refund instead of thrown, so a well-behaved gateway doesn't
   *    read a 4xx/5xx as "retry me" for a case retrying can never fix.
   */
  async handleWebhook(dto: PaymentWebhookDto): Promise<{ received: boolean }> {
    const bookingId = await this.resolveBookingId(dto);

    if (dto.status === 'failed') {
      await this.prisma.payment.updateMany({
        where: { bookingId },
        data: { status: PaymentStatus.FAILED },
      });
      this.logger.warn(`Payment failed for booking ${bookingId}.`);
      return { received: true };
    }

    await this.prisma.$transaction(async (tx) => {
      const confirmed = await tx.booking.updateMany({
        where: { id: bookingId, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CONFIRMED },
      });

      if (confirmed.count === 1) {
        await tx.payment.updateMany({
          where: { bookingId },
          data: {
            status: PaymentStatus.SUCCESS,
            transactionId: dto.transactionId,
          },
        });
        return;
      }

      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        this.logger.error(`Webhook referenced unknown booking ${bookingId}.`);
        return;
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        this.logger.warn(
          `Duplicate success webhook for already-confirmed booking ${bookingId}.`,
        );
        await tx.payment.updateMany({
          where: { bookingId },
          data: {
            status: PaymentStatus.SUCCESS,
            transactionId: dto.transactionId,
          },
        });
        return;
      }

      await tx.payment.updateMany({
        where: { bookingId },
        data: { status: PaymentStatus.FAILED },
      });
      this.logger.error(
        `CRITICAL: payment succeeded for booking ${bookingId} (status=${booking.status}) ` +
          'after its hold had already expired and inventory was released. Funds must be ' +
          'refunded manually -- the booking was NOT re-confirmed, to avoid a double-booking.',
      );
    });

    return { received: true };
  }

  /** Prefers an explicit bookingId; otherwise resolves it via the Payment row the gateway's transactionId points back to. */
  private async resolveBookingId(dto: PaymentWebhookDto): Promise<string> {
    if (dto.bookingId) {
      return dto.bookingId;
    }
    if (dto.transactionId) {
      const payment = await this.prisma.payment.findUnique({
        where: { transactionId: dto.transactionId },
      });
      if (!payment) {
        throw new NotFoundException(
          `No payment found for transactionId "${dto.transactionId}".`,
        );
      }
      return payment.bookingId;
    }
    throw new BadRequestException('transactionId or bookingId is required.');
  }
}
