import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/**
 * The Service-level fields every vertical create DTO needs, mirroring
 * CreateServiceDto (src/services/dto/create-service.dto.ts). `type` is
 * deliberately NOT here -- each vertical's controller sets it itself
 * (Hotels always creates ServiceType.HOTEL, etc.), except Transport, whose
 * DTO adds its own constrained `type` since a transport listing can be one
 * of FLIGHT/TRAIN/BUS.
 */
export class BaseCatalogCreateDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  location!: string;

  /** ADMIN-only escape hatch -- see SupplierOwnershipService.resolveSupplierId. */
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
