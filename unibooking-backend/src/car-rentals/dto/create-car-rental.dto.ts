import { IsEnum, IsInt, Min } from 'class-validator';
import { TransmissionType, VehicleType } from '@prisma/client';
import { BaseCatalogCreateDto } from '../../catalog/dto/base-catalog-create.dto';

export class CreateCarRentalDto extends BaseCatalogCreateDto {
  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsEnum(TransmissionType)
  transmission!: TransmissionType;

  @IsInt()
  @Min(1)
  seatingCapacity!: number;
}
