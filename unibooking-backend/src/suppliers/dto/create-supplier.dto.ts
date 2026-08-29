import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * No `userId` field -- the profile is always created for the caller
 * themselves, taken from the verified JWT (`user.sub`), never from the
 * request body. See SuppliersService.createProfile.
 */
export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  companyName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  @MinLength(6)
  contactPhone!: string;

  @IsOptional()
  @IsString()
  taxId?: string;
}
