import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TourDifficulty } from '@prisma/client';
import { BaseCatalogSearchDto } from '../../catalog/dto/base-catalog-search.dto';

export class TourSearchDto extends BaseCatalogSearchDto {
  /** The tour's departure date -- a fixed-date package, not a stay you check in/out of. */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minDurationDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxDurationDays?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(TourDifficulty)
  difficulty?: TourDifficulty;

  /** Party size to accommodate -- matches tours where minGroupSize <= groupSize <= maxGroupSize. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  groupSize?: number;
}
