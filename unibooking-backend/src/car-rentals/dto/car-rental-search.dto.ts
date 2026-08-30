import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TransmissionType, VehicleType } from '@prisma/client';
import { BaseCatalogSearchDto } from '../../catalog/dto/base-catalog-search.dto';

export class CarRentalSearchDto extends BaseCatalogSearchDto {
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  /** Minimum seats needed -- matches vehicles with seatingCapacity >= this. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minSeatingCapacity?: number;
}
