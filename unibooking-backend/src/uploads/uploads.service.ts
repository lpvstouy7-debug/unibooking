import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  StorageProvider,
  StoredFile,
} from './storage/storage-provider.interface';
import { AllowedMimeType } from './uploads.constants';

/**
 * Magic-byte signatures for each allowed type, checked against the file's
 * actual bytes rather than trusted from `file.mimetype` -- which is just
 * the client-sent Content-Type header for that form part, and passes
 * ParseFilePipe's FileTypeValidator (see uploads.controller.ts) even when
 * it's a lie. This is what stops a disguised script/executable from riding
 * through as an "image" by relabeling its extension and Content-Type.
 */
const MAGIC_BYTE_CHECKS: Record<AllowedMimeType, (buffer: Buffer) => boolean> =
  {
    'image/jpeg': (buf) =>
      buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
    'image/png': (buf) =>
      buf.length > 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
    'image/webp': (buf) =>
      buf.length > 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  };

const EXTENSION_BY_MIME_TYPE: Record<AllowedMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  storeFile(file: Express.Multer.File): Promise<StoredFile> {
    this.assertGenuineImage(file);
    return this.storage.save(file, this.buildFilename(file));
  }

  storeFiles(files: Express.Multer.File[]): Promise<StoredFile[]> {
    files.forEach((file) => this.assertGenuineImage(file));
    return Promise.all(
      files.map((file) => this.storage.save(file, this.buildFilename(file))),
    );
  }

  private assertGenuineImage(file: Express.Multer.File): void {
    const check = MAGIC_BYTE_CHECKS[file.mimetype as AllowedMimeType];
    if (!check || !check(file.buffer)) {
      throw new BadRequestException(
        `File "${file.originalname}" does not look like a genuine ${file.mimetype} image.`,
      );
    }
  }

  /** timestamp + uuid + original (or mimetype-derived) extension -- never the client-supplied filename, so a collision or a path-traversal-y original name can never overwrite another file. */
  private buildFilename(file: Express.Multer.File): string {
    const ext =
      extname(file.originalname).toLowerCase() ||
      EXTENSION_BY_MIME_TYPE[file.mimetype as AllowedMimeType] ||
      '';
    return `${Date.now()}-${uuidv4()}${ext}`;
  }
}
