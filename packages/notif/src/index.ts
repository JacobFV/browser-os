import { createId } from '@browser-os/core';
import { eventBus, NotificationEvent } from '@browser-os/core';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  timestamp: number;
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();

  show(title: string, options?: { body?: string; icon?: string }): string {
    const id = createId();
    const notification: Notification = {
      id,
      title,
      body: options?.body,
      icon: options?.icon,
      timestamp: Date.now(),
    };
    this.notifications.set(id, notification);
    eventBus.emit('notif', { type: 'show', id, title, body: options?.body });
    return id;
  }

  dismiss(id: string): void {
    this.notifications.delete(id);
    eventBus.emit('notif', { type: 'dismiss', id });
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const notificationManager = new NotificationManager();

export function showNotification(title: string, options?: { body?: string; icon?: string }): string {
  return notificationManager.show(title, options);
}

export function dismissNotification(id: string): void {
  notificationManager.dismiss(id);
}

