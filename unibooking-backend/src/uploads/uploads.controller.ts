import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { StoredFile } from './storage/storage-provider.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from './uploads.constants';

// memoryStorage, not diskStorage -- multer only buffers the upload here.
// UploadsService/StorageProvider owns where the bytes actually end up (see
// storage/storage-provider.interface.ts), which is what keeps "receive and
// validate a file" decoupled from "persist a file."
const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_UPLOAD },
};

/**
 * Rejects on size or declared MIME type before the file ever reaches
 * UploadsService. This is a fast, cheap first filter -- the authoritative
 * check against the file's actual bytes happens in
 * UploadsService.assertGenuineImage, since a MIME type here is only ever
 * the client's say-so.
 */
function imageValidationPipe(): ParseFilePipe {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
      new FileTypeValidator({
        fileType: new RegExp(`^(${ALLOWED_MIME_TYPES.join('|')})$`),
      }),
    ],
    exceptionFactory: (error) => new BadRequestException(error),
  });
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadSingle(
    @UploadedFile(imageValidationPipe()) file: Express.Multer.File,
  ): Promise<StoredFile> {
    return this.uploadsService.storeFile(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, multerOptions),
  )
  uploadMultiple(
    @UploadedFiles(imageValidationPipe()) files: Express.Multer.File[],
  ): Promise<StoredFile[]> {
    return this.uploadsService.storeFiles(files);
  }
}
