import { eventBus, NotificationEvent, createId } from '@browser-os/core';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  timestamp: number;
  read: boolean;
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  
  show(title: string, body?: string): string {
    const id = createId();
    const notification: Notification = {
      id,
      title,
      body,
      timestamp: Date.now(),
      read: false,
    };
    
    this.notifications.set(id, notification);
    eventBus.emit('notif', { type: 'show', id, title, body });
    
    return id;
  }
  
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.delete(id);
      eventBus.emit('notif', { type: 'dismiss', id });
    }
  }
  
  click(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      eventBus.emit('notif', { type: 'click', id });
    }
  }
  
  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }
  
  getUnread(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.read);
  }
  
  markRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
    }
  }
  
  clear(): void {
    const ids = Array.from(this.notifications.keys());
    ids.forEach(id => this.dismiss(id));
  }
}

export const notificationManager = new NotificationManager();

export function showNotification(title: string, body?: string): string {
  return notificationManager.show(title, body);
}

export function dismissNotification(id: string): void {
  notificationManager.dismiss(id);
}

export function clickNotification(id: string): void {
  notificationManager.click(id);
}

export function getAllNotifications(): Notification[] {
  return notificationManager.getAll();
}

export function getUnreadNotifications(): Notification[] {
  return notificationManager.getUnread();
}

export function markNotificationRead(id: string): void {
  notificationManager.markRead(id);
}

export function clearNotifications(): void {
  notificationManager.clear();
}
