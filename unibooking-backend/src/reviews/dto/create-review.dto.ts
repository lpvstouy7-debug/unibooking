import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  /**
   * Which Service this review is for. ReviewsService resolves this to a
   * specific eligible BookingItem server-side (see its comment) -- Review
   * itself is keyed by bookingItemId, not serviceId, so the client doesn't
   * (and can't) name the booking item directly.
   */
  @IsUUID()
  serviceId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
