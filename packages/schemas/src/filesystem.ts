import { z } from 'zod';

export const FileTypeSchema = z.enum(['file', 'directory']);

export const FileMetadataSchema = z.object({
  path: z.string(),
  type: FileTypeSchema,
  size: z.number(),
  createdAt: z.number(),
  modifiedAt: z.number(),
  permissions: z.string(), // Unix-like: "rwxrwxrwx"
});

export const BackendTypeSchema = z.enum(['localStorage', 'indexedDB', 'server', 'ephemeral']);

export const MountPointSchema = z.object({
  path: z.string(),
  backend: BackendTypeSchema,
  options: z.record(z.unknown()),
});

export type FileType = z.infer<typeof FileTypeSchema>;
export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export type BackendType = z.infer<typeof BackendTypeSchema>;
export type MountPoint = z.infer<typeof MountPointSchema>;

