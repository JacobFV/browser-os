import type { Notification } from '@browser-os/schemas';
import type { NotificationStoreOptions } from './types';

export class NotificationStore {
  private notifications: Notification[] = [];
  private options: Required<NotificationStoreOptions>;
  private storageKey = 'browser-os-notifications';

  constructor(options: NotificationStoreOptions = {}) {
    this.options = {
      maxNotifications: options.maxNotifications ?? 100,
      retentionDays: options.retentionDays ?? 7,
      useIndexedDB: options.useIndexedDB ?? false,
      dbName: options.dbName ?? 'browser-os-notifications',
    };

    this.load();
  }

  /**
   * Load notifications from storage
   */
  private load(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        // Filter out old notifications
        const cutoff = Date.now() - this.options.retentionDays * 24 * 60 * 60 * 1000;
        this.notifications = parsed.filter((n) => n.createdAt > cutoff);
        // Limit to maxNotifications
        if (this.notifications.length > this.options.maxNotifications) {
          this.notifications = this.notifications
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, this.options.maxNotifications);
        }
        this.save();
      }
    } catch (error) {
      console.error('[NotificationStore] Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  /**
   * Save notifications to storage
   */
  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('[NotificationStore] Failed to save notifications:', error);
    }
  }

  /**
   * Add a notification
   */
  add(notification: Notification): void {
    this.notifications.unshift(notification); // Add to beginning
    // Limit to maxNotifications
    if (this.notifications.length > this.options.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.options.maxNotifications);
    }
    this.save();
  }

  /**
   * Update a notification
   */
  update(id: string, updates: Partial<Notification>): void {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
      this.save();
    }
  }

  /**
   * Remove a notification
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.save();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get notifications by status
   */
  getByStatus(status: Notification['status']): Notification[] {
    return this.notifications.filter((n) => n.status === status);
  }

  /**
   * Get notifications by app
   */
  getByApp(appId: string): Notification[] {
    return this.notifications.filter((n) => n.appId === appId);
  }

  /**
   * Get notifications by priority
   */
  getByPriority(priority: Notification['priority']): Notification[] {
    return this.notifications.filter((n) => n.priority === priority);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.save();
  }

  /**
   * Clear old notifications based on retention policy
   */
  clearOld(): void {
    const cutoff = Date.now() - this.options.retentionDays * 24 * 60 * 60 * 1000;
    this.notifications = this.notifications.filter((n) => n.createdAt > cutoff);
    this.save();
  }

  /**
   * Get count of unread notifications
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => n.status === 'pending').length;
  }
}

