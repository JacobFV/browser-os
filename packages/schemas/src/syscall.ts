import { z } from 'zod';

export const SyscallRequestSchema = z.object({
  id: z.string().uuid(),
  syscall: z.string(),
  args: z.record(z.unknown()),
  pid: z.number().optional(),
});

export const SyscallResponseSchema = z.object({
  id: z.string().uuid(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type SyscallRequest = z.infer<typeof SyscallRequestSchema>;
export type SyscallResponse = z.infer<typeof SyscallResponseSchema>;

