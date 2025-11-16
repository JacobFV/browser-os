import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  homeDir: z.string(),
  defaultShell: z.string().optional(),
});

export const SystemConfigSchema = z.object({
  users: z.array(UserSchema),
  defaultUser: z.string(),
  mounts: z.array(z.object({
    path: z.string(),
    backend: z.enum(['localStorage', 'indexedDB', 'server', 'ephemeral']),
    options: z.record(z.unknown()),
  })),
  system: z.object({
    hostname: z.string(),
    timezone: z.string().optional(),
    maxRecentFiles: z.number().optional().default(10),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type SystemConfig = z.infer<typeof SystemConfigSchema>;

