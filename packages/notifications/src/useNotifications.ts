import { useEffect, useState } from 'react';
import type { Notification } from '@browser-os/schemas';
import type { NotificationManager } from './NotificationManager';

export interface UseNotificationsOptions {
  notificationManager: NotificationManager;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * React hook for accessing notification state
 */
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const { notificationManager } = options;
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    notificationManager.getNotifications()
  );
  const [unreadCount, setUnreadCount] = useState(() => notificationManager.getUnreadCount());

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationManager.getUnreadCount());
    });

    return unsubscribe;
  }, [notificationManager]);

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationManager.markAsRead(id),
    markAllAsRead: () => notificationManager.markAllAsRead(),
    dismiss: (id: string) => notificationManager.dismissNotification(id),
    dismissAll: () => notificationManager.dismissAll(),
  };
}

