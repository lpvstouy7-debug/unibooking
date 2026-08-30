import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { TourDifficulty } from '@prisma/client';
import { BaseCatalogCreateDto } from '../../catalog/dto/base-catalog-create.dto';

export class CreateTourDto extends BaseCatalogCreateDto {
  @IsInt()
  @Min(1)
  durationDays!: number;

  @IsString()
  category!: string;

  @IsEnum(TourDifficulty)
  difficulty!: TourDifficulty;

  @IsInt()
  @Min(1)
  minGroupSize!: number;

  @IsInt()
  @Min(1)
  maxGroupSize!: number;
}
