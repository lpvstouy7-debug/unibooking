import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface PrismaErrorMapping {
  status: HttpStatus;
  buildMessage: (error: Prisma.PrismaClientKnownRequestError) => string;
}

/**
 * Maps Prisma's stable error codes to the HTTP status + human-readable
 * message the API should return. Extend this map as new constraints are
 * added to schema.prisma (e.g. more @@unique / @relation onDelete rules).
 *
 * Reference: https://www.prisma.io/docs/orm/reference/error-reference
 */
const PRISMA_ERROR_MAP: Record<string, PrismaErrorMapping> = {
  // Unique constraint violation -- e.g. User.email, Booking.bookingReference,
  // Payment.transactionId, or the InventoryPricing @@unique([serviceId, date]).
  P2002: {
    status: HttpStatus.CONFLICT,
    buildMessage: (error) => {
      const target = error.meta?.target;
      const field =
        typeof target === 'string'
          ? target
          : Array.isArray(target)
            ? target.join(', ')
            : 'field';
      return `A record with this ${field} already exists.`;
    },
  },

  // .findUniqueOrThrow / .update / .delete targeting a row that doesn't exist.
  // Deliberately NOT forwarding Prisma's own `meta.cause` text -- it echoes
  // internal model/relation names straight from the ORM layer, which is
  // exactly the kind of schema detail this filter exists to keep off the wire.
  P2025: {
    status: HttpStatus.NOT_FOUND,
    buildMessage: () => 'The requested record could not be found.',
  },

  // Foreign key constraint failed -- e.g. booking a serviceId that was deleted.
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    buildMessage: (error) => {
      const field =
        (error.meta?.field_name as string | undefined) ?? 'a related record';
      return `Invalid reference: ${field} does not exist.`;
    },
  },

  // Required relation would be violated by this change (e.g. deleting a
  // Supplier that still has active Services, without onDelete: Cascade).
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    buildMessage: () =>
      'This change would violate a required relation between records.',
  },

  // Value too long / out of range for the column type.
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    buildMessage: () =>
      'One of the provided values is too long for its column.',
  },
};

/**
 * Global filter that intercepts every `PrismaClientKnownRequestError` thrown
 * anywhere in the app (services, repositories, etc.) and turns Prisma's raw
 * error codes into a clean, predictable REST error shape instead of leaking
 * a raw 500 + stack trace to API consumers.
 *
 * Registered globally in AppModule via the APP_FILTER token -- see
 * src/app.module.ts.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapping = PRISMA_ERROR_MAP[exception.code];
    const status = mapping?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = mapping
      ? mapping.buildMessage(exception)
      : 'An unexpected database error occurred.';

    if (!mapping) {
      // Codes we haven't explicitly mapped still return a safe generic 500
      // to the client, but we log the real code/message so it's not silently lost.
      this.logger.error(
        `Unhandled Prisma error code ${exception.code}: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      error: mapping
        ? 'Database Constraint Violation'
        : 'Internal Server Error',
      message,
      // Only echo the Prisma error code back for constraints we've explicitly
      // mapped (a stable, documented contract clients can branch on). An
      // *unmapped* code means an unexpected failure mode -- surfacing it
      // fingerprints the ORM/driver internals to the caller for no benefit,
      // so it stays server-side only (logged above).
      ...(mapping ? { code: exception.code } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
