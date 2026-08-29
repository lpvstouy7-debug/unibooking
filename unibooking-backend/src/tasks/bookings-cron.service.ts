import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Only what's needed to restore stock -- inventoryPricingId + quantity per
// line item, nothing about the underlying service/customer.
const expiredBookingInclude = { items: true } satisfies Prisma.BookingInclude;
type ExpiredBooking = Prisma.BookingGetPayload<{
  include: typeof expiredBookingInclude;
}>;

@Injectable()
export class BookingsCronService {
  private readonly logger = new Logger(BookingsCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sweeps PENDING bookings whose hold has expired and gives their
   * inventory back. Runs every minute -- against Booking.expiresAt set to a
   * 15-minute hold in BookingsService.createBooking, that's an acceptable
   * worst-case lag between "hold expires" and "stock is bookable again."
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredBookings(): Promise<void> {
    const expired = await this.prisma.booking.findMany({
      where: { status: BookingStatus.PENDING, expiresAt: { lte: new Date() } },
      include: expiredBookingInclude,
    });

    if (expired.length === 0) {
      return;
    }

    this.logger.log(`Releasing ${expired.length} expired booking(s).`);

    // One booking's failure must never abort the sweep for the rest --
    // each release is independent, so a caught error here just leaves that
    // one booking to be retried on the next tick instead of losing the
    // whole batch to it.
    for (const booking of expired) {
      try {
        await this.releaseBooking(booking);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to release booking ${booking.id} (${booking.bookingReference}): ${message}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  /**
   * Status flip and inventory restore happen in one transaction, and the
   * flip is a conditional `updateMany` -- not a blind `update` -- guarded
   * on `status: PENDING`. That guard is what keeps this consistent against
   * the one race that actually matters here: a payment webhook confirming
   * this exact booking in the same instant the cron tick picked it up as
   * expired. Whichever write reaches the row first wins; if this update
   * affects 0 rows, the booking was already confirmed (or already
   * cancelled) by something else, and the transaction returns without
   * touching inventory it no longer has any business releasing.
   */
  private async releaseBooking(booking: ExpiredBooking): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const result = await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CANCELLED },
      });

      if (result.count === 0) {
        return;
      }

      for (const item of booking.items) {
        await tx.inventoryPricing.update({
          where: { id: item.inventoryPricingId },
          data: { availableUnits: { increment: item.quantity } },
        });
      }
    });
  }
}
