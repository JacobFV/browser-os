import { EventBus, NotificationEvent, createId } from '@browser-os/core';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  timestamp: number;
  read: boolean;
}

export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
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
    this.eventBus.emit('notif', { type: 'show', id, title, body });
    
    return id;
  }
  
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.delete(id);
      this.eventBus.emit('notif', { type: 'dismiss', id });
    }
  }
  
  click(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      this.eventBus.emit('notif', { type: 'click', id });
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
