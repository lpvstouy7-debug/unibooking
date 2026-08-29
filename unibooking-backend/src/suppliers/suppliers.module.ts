import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { UsersModule } from '../users/users.module';

@Module({
  // UsersModule exports UsersService -- needed to verify the JWT's user.sub
  // still corresponds to a real account before creating the Supplier row.
  imports: [UsersModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
