export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_UPLOAD = 5;

// Single source of truth for "what counts as an allowed image" -- read by
// both the interceptor-level ParseFilePipe (checks the declared
// Content-Type) and UploadsService's magic-byte check (checks the actual
// bytes), so the two can never silently drift apart.
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
