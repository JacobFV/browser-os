import { z } from 'zod';

export const AppManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  entrypoint: z.string(), // Path to JS file in bin/
  permissions: z.array(z.string()), // Required syscalls
  icon: z.string().optional(), // Path to icon
});

export const AppRegistryEntrySchema = z.object({
  id: z.string(),
  installedAt: z.number(),
  installedBy: z.string(), // User ID
  enabled: z.boolean(),
  manifest: AppManifestSchema,
});

export type AppManifest = z.infer<typeof AppManifestSchema>;
export type AppRegistryEntry = z.infer<typeof AppRegistryEntrySchema>;

