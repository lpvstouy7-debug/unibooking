import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export enum ServiceSortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
}

export class SearchServicesQueryDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  /**
   * startDate/endDate must be supplied together -- enforced in
   * ServicesService.search(), not here, so the 400 can name the actual
   * pairing rule instead of two unrelated per-field errors.
   */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /**
   * Price lives per night on InventoryPricing, not on Service itself, so
   * these (and sortBy: price_asc/price_desc) only mean something alongside
   * a date range -- also enforced in ServicesService.search(), for the
   * same reason as above.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ServiceSortBy)
  sortBy?: ServiceSortBy;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
