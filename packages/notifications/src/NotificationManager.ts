import type { Notification, CreateNotificationOptions, NotificationPriority } from '@browser-os/schemas';
import type { EventBus } from '@browser-os/events';
import { NotificationStore } from './NotificationStore';
import type { NotificationManagerOptions, NotificationChangeCallback, NotificationSettings } from './types';

export class NotificationManager {
  private store: NotificationStore;
  private eventBus: EventBus;
  private subscribers: Set<NotificationChangeCallback> = new Set();
  private settings: NotificationSettings = {
    enabled: true,
    soundEnabled: false,
    toastPosition: 'top-right',
    autoDismissTimeout: 5000,
    doNotDisturb: false,
    appPermissions: {},
  };

  constructor(options: NotificationManagerOptions) {
    this.eventBus = options.eventBus;
    this.store = new NotificationStore(options.store);

    // Load settings from localStorage
    this.loadSettings();

    // Set up event bus listeners
    this.setupEventListeners();

    // Clean up old notifications periodically
    setInterval(() => {
      this.store.clearOld();
      this.notifySubscribers();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Create a new notification
   */
  createNotification(options: CreateNotificationOptions): Notification {
    // Check if notifications are enabled
    if (!this.settings.enabled || this.settings.doNotDisturb) {
      return this.createSilentNotification(options);
    }

    // Check app permissions
    if (options.appId && this.settings.appPermissions[options.appId] === false) {
      return this.createSilentNotification(options);
    }

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: options.title,
      message: options.message,
      appId: options.appId,
      icon: options.icon,
      priority: options.priority ?? 'normal',
      status: 'pending',
      actions: options.actions ?? [],
      createdAt: Date.now(),
      metadata: options.metadata,
    };

    this.store.add(notification);
    this.notifySubscribers();

    // Emit event
    this.eventBus.emit('notification:created', notification, { source: 'notification-manager' });

    // Play sound if enabled
    if (this.settings.soundEnabled) {
      this.playNotificationSound(notification.priority);
    }

    return notification;
  }

  /**
   * Create a silent notification (for logging/history when notifications are disabled)
   */
  private createSilentNotification(options: CreateNotificationOptions): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: options.title,
      message: options.message,
      appId: options.appId,
      icon: options.icon,
      priority: options.priority ?? 'normal',
      status: 'dismissed', // Mark as dismissed immediately
      actions: options.actions ?? [],
      createdAt: Date.now(),
      dismissedAt: Date.now(),
      metadata: options.metadata,
    };

    this.store.add(notification);
    return notification;
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(id: string): void {
    const notification = this.store.getAll().find((n) => n.id === id);
    if (notification && notification.status !== 'dismissed') {
      this.store.update(id, {
        status: 'dismissed',
        dismissedAt: Date.now(),
      });
      this.notifySubscribers();
      this.eventBus.emit('notification:dismissed', { id }, { source: 'notification-manager' });
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    const notifications = this.store.getAll();
    notifications.forEach((n) => {
      if (n.status !== 'dismissed') {
        this.store.update(n.id, {
          status: 'dismissed',
          dismissedAt: Date.now(),
        });
      }
    });
    this.notifySubscribers();
    this.eventBus.emit('notification:dismissed', { all: true }, { source: 'notification-manager' });
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.store.getAll().find((n) => n.id === id);
    if (notification && notification.status === 'pending') {
      this.store.update(id, {
        status: 'read',
        readAt: Date.now(),
      });
      this.notifySubscribers();
      this.eventBus.emit('notification:read', { id }, { source: 'notification-manager' });
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    const notifications = this.store.getAll();
    notifications.forEach((n) => {
      if (n.status === 'pending') {
        this.store.update(n.id, {
          status: 'read',
          readAt: Date.now(),
        });
      }
    });
    this.notifySubscribers();
    this.eventBus.emit('notification:read', { all: true }, { source: 'notification-manager' });
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.store.getAll();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.store.getUnreadCount();
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.store.clear();
    this.notifySubscribers();
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(callback: NotificationChangeCallback): () => void {
    this.subscribers.add(callback);
    // Immediately call with current notifications
    callback(this.store.getAll());

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    const notifications = this.store.getAll();
    this.subscribers.forEach((callback) => {
      try {
        callback(notifications);
      } catch (error) {
        console.error('[NotificationManager] Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Set up event bus listeners
   */
  private setupEventListeners(): void {
    // Listen for notification creation requests
    this.eventBus.on('notification:create', (event) => {
      const options = event.payload as CreateNotificationOptions;
      this.createNotification(options);
    });

    // Listen for notification dismiss requests
    this.eventBus.on('notification:dismiss', (event) => {
      const { id } = event.payload as { id?: string };
      if (id) {
        this.dismissNotification(id);
      } else {
        this.dismissAll();
      }
    });

    // Listen for mark as read requests
    this.eventBus.on('notification:mark-read', (event) => {
      const { id } = event.payload as { id?: string };
      if (id) {
        this.markAsRead(id);
      } else {
        this.markAllAsRead();
      }
    });

    // Listen for app events to create system notifications
    this.eventBus.onPattern(/^app:installed$/, (event) => {
      const { appId } = event.payload as { appId: string };
      this.createNotification({
        title: 'App Installed',
        message: `Application has been installed`,
        appId,
        priority: 'normal',
      });
    });
  }

  /**
   * Play notification sound based on priority
   */
  private playNotificationSound(priority: NotificationPriority): void {
    // This would play a sound file based on priority
    // For now, just a placeholder
    try {
      const audio = new Audio();
      // In a real implementation, you'd have sound files for different priorities
      // audio.src = `/sounds/notification-${priority}.mp3`;
      // audio.play().catch(() => {
      //   // Ignore errors if audio fails to play
      // });
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Get settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('browser-os-notification-settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[NotificationManager] Failed to load settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('browser-os-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[NotificationManager] Failed to save settings:', error);
    }
  }
}

