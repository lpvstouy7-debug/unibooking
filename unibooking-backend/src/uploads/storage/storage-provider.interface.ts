export interface StoredFile {
  filename: string;
  url: string;
}

/**
 * The seam between "we received a validated image in memory" and "it's
 * durably stored somewhere." UploadsService depends on this interface, not
 * on LocalDiskStorageProvider directly (see the STORAGE_PROVIDER binding in
 * uploads.module.ts) -- an S3StorageProvider/CloudinaryStorageProvider
 * implementing the same `save()` signature is a one-line change in the
 * module, with zero changes to UploadsService or UploadsController.
 */
export interface StorageProvider {
  save(file: Express.Multer.File, filename: string): Promise<StoredFile>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
