import { Module } from '@nestjs/common';
import { CatalogCommonModule } from '../catalog/catalog-common.module';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';

@Module({
  imports: [CatalogCommonModule],
  controllers: [TransportController],
  providers: [TransportService],
})
export class TransportModule {}
