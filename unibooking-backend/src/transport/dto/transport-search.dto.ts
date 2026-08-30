import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SeatClass, ServiceType } from '@prisma/client';
import { BaseCatalogSearchDto } from '../../catalog/dto/base-catalog-search.dto';

/** The three ServiceTypes this vertical covers -- distinct from HOTEL/TOUR/CAR_RENTAL/PACKAGE. */
export const TRANSPORT_SERVICE_TYPES = [
  ServiceType.FLIGHT,
  ServiceType.TRAIN,
  ServiceType.BUS,
] as const;

export class TransportSearchDto extends BaseCatalogSearchDto {
  /** Narrow to one vehicle mode; omit to search flights+trains+buses together. */
  @IsOptional()
  @IsEnum(ServiceType)
  mode?: ServiceType;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  /** Single travel date -- a transport leg is a same-day service, not a stay. */
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsEnum(SeatClass)
  seatClass?: SeatClass;
}
