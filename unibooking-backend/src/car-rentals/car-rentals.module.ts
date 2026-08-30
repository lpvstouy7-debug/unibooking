import { Module } from '@nestjs/common';
import { CatalogCommonModule } from '../catalog/catalog-common.module';
import { CarRentalsController } from './car-rentals.controller';
import { CarRentalsService } from './car-rentals.service';

@Module({
  imports: [CatalogCommonModule],
  controllers: [CarRentalsController],
  providers: [CarRentalsService],
})
export class CarRentalsModule {}
