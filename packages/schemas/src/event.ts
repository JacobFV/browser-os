import { z } from 'zod';

export const EventSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
  source: z.string().optional(), // PID or module name
  target: z.string().optional(), // Specific target, or broadcast if absent
  timestamp: z.number(),
});

export type Event = z.infer<typeof EventSchema>;

