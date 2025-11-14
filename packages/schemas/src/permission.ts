import { z } from 'zod';

export const PermissionSchema = z.object({
  pid: z.number(),
  allowedSyscalls: z.array(z.string()),
  deniedSyscalls: z.array(z.string()).optional(),
  fsAccess: z.array(z.string()), // Allowed paths (supports globs)
});

export type Permission = z.infer<typeof PermissionSchema>;

