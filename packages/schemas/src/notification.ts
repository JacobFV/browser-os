import { z } from 'zod';

export const NotificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const NotificationStatusSchema = z.enum(['pending', 'read', 'dismissed']);

export const NotificationActionSchema = z.object({
  label: z.string(),
  action: z.string(), // Action identifier (e.g., 'open-file', 'dismiss', 'open-app')
  data: z.unknown().optional(), // Additional data for the action
});

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  appId: z.string().optional(), // App that created the notification
  icon: z.string().optional(), // Icon URL or path
  priority: NotificationPrioritySchema.default('normal'),
  status: NotificationStatusSchema.default('pending'),
  actions: z.array(NotificationActionSchema).default([]),
  createdAt: z.number(), // Timestamp
  readAt: z.number().optional(), // Timestamp when read
  dismissedAt: z.number().optional(), // Timestamp when dismissed
  metadata: z.record(z.unknown()).optional(), // Additional metadata
});

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;
export type NotificationAction = z.infer<typeof NotificationActionSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

export interface CreateNotificationOptions {
  title: string;
  message: string;
  appId?: string;
  icon?: string;
  priority?: NotificationPriority;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
}

