import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  serviceId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  // Rooms/seats requested, applied uniformly across every night in the range.
  @IsInt()
  @Min(1)
  units!: number;
}
