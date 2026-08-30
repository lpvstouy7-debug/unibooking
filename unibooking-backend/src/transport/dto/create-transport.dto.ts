import { IsEnum, IsIn, IsString } from 'class-validator';
import { SeatClass, ServiceType } from '@prisma/client';
import { BaseCatalogCreateDto } from '../../catalog/dto/base-catalog-create.dto';
import { TRANSPORT_SERVICE_TYPES } from './transport-search.dto';

export class CreateTransportDto extends BaseCatalogCreateDto {
  /** Which vehicle mode this listing is -- must be one of FLIGHT/TRAIN/BUS, not HOTEL/TOUR/etc. */
  @IsIn(TRANSPORT_SERVICE_TYPES)
  type!: ServiceType;

  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsEnum(SeatClass)
  seatClass!: SeatClass;
}
