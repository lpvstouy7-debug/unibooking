import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // AuthModule needs findByEmail() for credential lookup during login.
  exports: [UsersService],
})
export class UsersModule {}
