import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { HotelPropertyType } from '@prisma/client';
import { BaseCatalogSearchDto } from '../../catalog/dto/base-catalog-search.dto';

/** Accepts `?amenities=WiFi,Pool` or repeated `?amenities=WiFi&amenities=Pool`. */
function toStringArray({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value : [value];
  return raw.flatMap((entry) => String(entry).split(',')).map((s) => s.trim()).filter(Boolean);
}

export class HotelSearchDto extends BaseCatalogSearchDto {
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  /** Minimum star rating -- e.g. starRating=4 returns 4- and 5-star hotels. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  starRating?: number;

  @IsOptional()
  @IsEnum(HotelPropertyType)
  propertyType?: HotelPropertyType;

  /** Must have ALL listed amenities (Prisma `hasEvery`), not merely one. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(toStringArray)
  amenities?: string[];
}
