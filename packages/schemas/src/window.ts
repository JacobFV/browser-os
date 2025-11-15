import { z } from 'zod';

export const WindowStateSchema = z.enum(['normal', 'minimized', 'maximized']);

export const WindowSchema = z.object({
  id: z.string(),
  title: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  minWidth: z.number().default(200),
  minHeight: z.number().default(150),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  zIndex: z.number(),
  state: WindowStateSchema,
  workspaceId: z.string(),
  appId: z.string().optional(), // Optional app ID if window is associated with an app
  resizable: z.boolean().default(true),
  movable: z.boolean().default(true),
  closable: z.boolean().default(true),
  minimizable: z.boolean().default(true),
  maximizable: z.boolean().default(true),
});

export type WindowState = z.infer<typeof WindowStateSchema>;
export type Window = z.infer<typeof WindowSchema>;

