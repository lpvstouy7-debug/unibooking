import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateServiceDto {
  @IsEnum(ServiceType)
  type!: ServiceType;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  location!: string;

  /**
   * ADMIN-only escape hatch to create a listing on behalf of a supplier. A
   * SUPPLIER caller always lists under their own profile regardless of what
   * they send here -- see ServicesService.resolveSupplierId, which is the
   * thing that actually enforces this, not the DTO.
   */
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
