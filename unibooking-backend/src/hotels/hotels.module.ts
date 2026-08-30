import { Module } from '@nestjs/common';
import { CatalogCommonModule } from '../catalog/catalog-common.module';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';

@Module({
  imports: [CatalogCommonModule],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
