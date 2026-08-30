import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HotelPropertyType } from '@prisma/client';
import { BaseCatalogCreateDto } from '../../catalog/dto/base-catalog-create.dto';

export class CreateHotelDto extends BaseCatalogCreateDto {
  @IsInt()
  @Min(1)
  @Max(5)
  starRating!: number;

  @IsEnum(HotelPropertyType)
  propertyType!: HotelPropertyType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  amenities?: string[];
}
