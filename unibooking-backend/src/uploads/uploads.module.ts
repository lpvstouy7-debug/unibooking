import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { LocalDiskStorageProvider } from './storage/local-disk-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    // Bound through the STORAGE_PROVIDER token rather than UploadsService
    // depending on LocalDiskStorageProvider directly -- swapping to
    // S3StorageProvider later is this one line, with nothing else in the
    // module (or in UploadsService/UploadsController) touched.
    { provide: STORAGE_PROVIDER, useClass: LocalDiskStorageProvider },
  ],
})
export class UploadsModule {}
