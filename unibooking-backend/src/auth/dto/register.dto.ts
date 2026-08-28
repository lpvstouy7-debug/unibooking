import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Deliberately has no `role` field. Letting a client choose its own Role
 * (ADMIN/CUSTOMER/SUPPLIER) at self-registration is a privilege-escalation
 * hole -- every public sign-up becomes CUSTOMER (the Prisma schema default).
 * Promoting a user to SUPPLIER/ADMIN is an explicit, separately-guarded
 * admin action in a later phase, not something registration exposes.
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
