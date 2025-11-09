import { z } from 'zod';

/**
 * Zod schemas for validation
 */

export const IdSchema = z.string().min(1);

export const WindowBoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const WindowStateSchema = z.enum([
  'floating',
  'docked',
  'minimized',
  'maximized',
  'fullscreen',
]);

export const ProcessStateSchema = z.enum([
  'starting',
  'running',
  'suspended',
  'stopped',
  'crashed',
]);

export const CapabilitySchema = z.enum([
  'fs.read',
  'fs.write',
  'net.fetch',
  'net.ws',
  'clipboard',
  'notifications',
  'camera',
  'mic',
  'rtc',
  'proc.spawn',
  'proc.ipc',
]);

export const AppManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  icon: z.string(),
  entry: z.function(),
  background: z.function().optional(),
  defaultWindow: z
    .object({
      w: z.number().positive(),
      h: z.number().positive(),
      resizable: z.boolean().optional(),
    })
    .optional(),
  permissions: z.array(CapabilitySchema).optional(),
  intents: z.array(z.string()).optional(),
});

export type AppManifest = z.infer<typeof AppManifestSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;
export type ProcessState = z.infer<typeof ProcessStateSchema>;
export type WindowState = z.infer<typeof WindowStateSchema>;
export type WindowBounds = z.infer<typeof WindowBoundsSchema>;

