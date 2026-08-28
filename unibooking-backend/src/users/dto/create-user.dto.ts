import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Internal shape UsersService.create() accepts -- `password` is always
 * plaintext here; UsersService is the one place responsible for hashing it
 * before it touches Prisma/Postgres. Callers (AuthService.register, and any
 * future admin "create user" flow) never hash it themselves.
 */
export class CreateUserDto {
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
