import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, StoredFile } from './storage-provider.interface';

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider, OnModuleInit {
  private readonly logger = new Logger(LocalDiskStorageProvider.name);

  // process.cwd() (the project root the app is launched from), not
  // __dirname -- __dirname would resolve inside dist/ once compiled,
  // pointing at a different directory than the one ServeStaticModule is
  // told to serve in app.module.ts. Both must agree on the same path.
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {}

  /**
   * `recursive: true` makes this a safe no-op if ./uploads already exists
   * and creates it (plus any missing parent segments) if not -- so a fresh
   * checkout or container never fails an upload just because the directory
   * hasn't been created yet.
   */
  async onModuleInit(): Promise<void> {
    await mkdir(this.uploadsDir, { recursive: true });
    this.logger.log(`Serving uploads from ${this.uploadsDir}`);
  }

  async save(file: Express.Multer.File, filename: string): Promise<StoredFile> {
    const destination = join(this.uploadsDir, filename);
    await writeFile(destination, file.buffer);

    const baseUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    return { filename, url: `${baseUrl}/uploads/${filename}` };
  }
}
