import { z } from 'zod';

export const ProcessStatusSchema = z.enum(['running', 'stopped', 'terminated']);

export const ProcessSchema = z.object({
  pid: z.number(),
  ppid: z.number().nullable(),
  name: z.string(),
  status: ProcessStatusSchema,
  cwd: z.string(),
  env: z.record(z.string()),
});

export type ProcessStatus = z.infer<typeof ProcessStatusSchema>;
export type Process = z.infer<typeof ProcessSchema>;

