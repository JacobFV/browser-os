import { z } from 'zod';

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  index: z.number(), // 0-based index for keyboard shortcuts
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

