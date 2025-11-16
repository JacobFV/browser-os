import type { Notification, CreateNotificationOptions } from '@browser-os/schemas';

export interface NotificationStoreOptions {
  maxNotifications?: number;
  retentionDays?: number;
  useIndexedDB?: boolean;
  dbName?: string;
}

export interface NotificationManagerOptions {
  eventBus: import('@browser-os/events').EventBus;
  store?: NotificationStoreOptions;
}

export type NotificationChangeCallback = (notifications: Notification[]) => void;

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  toastPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoDismissTimeout: number; // milliseconds
  doNotDisturb: boolean;
  quietHoursStart?: number; // hour (0-23)
  quietHoursEnd?: number; // hour (0-23)
  appPermissions: Record<string, boolean>; // appId -> enabled
}

