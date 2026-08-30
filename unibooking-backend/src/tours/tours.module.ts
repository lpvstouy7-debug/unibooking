import { Module } from '@nestjs/common';
import { CatalogCommonModule } from '../catalog/catalog-common.module';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [CatalogCommonModule],
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
