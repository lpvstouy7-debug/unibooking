import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CatalogSortBy } from '../availability-search.service';

/**
 * Fields every vertical search DTO shares: free-text location, a price
 * range (meaning varies per vertical -- per-night, per-ticket, per-day --
 * but always maps onto InventoryPricing.price), sort, and pagination.
 * Each vertical DTO extends this and adds its own filters plus whichever
 * date field(s) make sense for it (checkInDate/checkOutDate,
 * departureDate, pickupDate/returnDate, ...).
 */
export class BaseCatalogSearchDto {
  @IsOptional()
  @IsString()
  location?: string;

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
  @IsEnum(CatalogSortBy)
  sortBy?: CatalogSortBy;

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
