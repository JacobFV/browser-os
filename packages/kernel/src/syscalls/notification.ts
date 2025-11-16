import type { NotificationManager } from '@browser-os/notifications';
import type { ProcessManager } from '@browser-os/proc';
import type { SyscallHandler } from '../types';

export function createNotificationSyscalls(
  notificationManager: NotificationManager,
  procManager: ProcessManager
): Record<string, SyscallHandler> {
  /**
   * Check if a process owns a notification
   */
  function ownsNotification(pid: number, notificationId: string): boolean {
    const notification = notificationManager.getNotifications().find((n) => n.id === notificationId);
    if (!notification) {
      return false;
    }

    // Get process to check appId
    const process = procManager.get(pid);
    if (!process) {
      return false;
    }

    // Process name is set to appId when spawned
    return notification.appId === process.name;
  }

  /**
   * Get appId from process
   */
  function getAppId(pid: number): string | null {
    const process = procManager.get(pid);
    return process ? process.name : null;
  }

  return {
    'notification.create': async (args, context) => {
      const options = args.options as {
        title: string;
        message: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        actions?: Array<{
          label: string;
          action: string;
          data?: unknown;
        }>;
        icon?: string;
        metadata?: Record<string, unknown>;
      };

      if (!options?.title) {
        throw new Error('title required');
      }
      if (!options.message) {
        throw new Error('message required');
      }

      // Get appId from process
      const appId = getAppId(context.pid);
      if (!appId) {
        throw new Error('Process not found');
      }

      // Create notification with appId
      const notification = notificationManager.createNotification({
        title: options.title,
        message: options.message,
        appId,
        priority: options.priority,
        actions: options.actions,
        icon: options.icon,
        metadata: options.metadata,
      });

      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        status: notification.status,
        createdAt: notification.createdAt,
        appId: notification.appId,
        actions: notification.actions,
      };
    },

    'notification.dismiss': async (args, context) => {
      const notificationId = args.id as string;
      if (!notificationId) {
        throw new Error('notification id required');
      }

      // Check ownership
      if (!ownsNotification(context.pid, notificationId)) {
        throw new Error('Permission denied: notification does not belong to this process');
      }

      notificationManager.dismissNotification(notificationId);
      return null;
    },

    'notification.dismissAll': async (args, context) => {
      const appId = getAppId(context.pid);
      if (!appId) {
        throw new Error('Process not found');
      }

      // Get all notifications for this app
      const notifications = notificationManager.getNotifications().filter((n) => n.appId === appId);
      notifications.forEach((n) => {
        notificationManager.dismissNotification(n.id);
      });

      return null;
    },

    'notification.markAsRead': async (args, context) => {
      const notificationId = args.id as string;
      if (!notificationId) {
        throw new Error('notification id required');
      }

      // Check ownership
      if (!ownsNotification(context.pid, notificationId)) {
        throw new Error('Permission denied: notification does not belong to this process');
      }

      notificationManager.markAsRead(notificationId);
      return null;
    },

    'notification.markAllAsRead': async (args, context) => {
      const appId = getAppId(context.pid);
      if (!appId) {
        throw new Error('Process not found');
      }

      // Get all unread notifications for this app
      const notifications = notificationManager
        .getNotifications()
        .filter((n) => n.appId === appId && n.status === 'pending');
      notifications.forEach((n) => {
        notificationManager.markAsRead(n.id);
      });

      return null;
    },

    'notification.getUnreadCount': async (args, context) => {
      const appId = getAppId(context.pid);
      if (!appId) {
        throw new Error('Process not found');
      }

      const notifications = notificationManager
        .getNotifications()
        .filter((n) => n.appId === appId && n.status === 'pending');
      return notifications.length;
    },

    'notification.getNotifications': async (args, context) => {
      const filter = (args.filter as 'all' | 'unread' | 'dismissed') ?? 'all';
      const appId = getAppId(context.pid);
      if (!appId) {
        throw new Error('Process not found');
      }

      let notifications = notificationManager.getNotifications().filter((n) => n.appId === appId);

      // Apply filter
      if (filter === 'unread') {
        notifications = notifications.filter((n) => n.status === 'pending');
      } else if (filter === 'dismissed') {
        notifications = notifications.filter((n) => n.status === 'dismissed');
      }

      // Return serializable notification data
      return notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        priority: n.priority,
        status: n.status,
        createdAt: n.createdAt,
        appId: n.appId,
        actions: n.actions,
        readAt: n.readAt,
        dismissedAt: n.dismissedAt,
      }));
    },
  };
}

