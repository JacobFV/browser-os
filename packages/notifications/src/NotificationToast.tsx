import React, { useEffect, useState } from 'react';
import type { Notification } from '@browser-os/schemas';
import { NotificationItem } from './NotificationItem';
import './NotificationToast.css';

export interface NotificationToastProps {
  notifications: Notification[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoDismissTimeout?: number;
  onDismiss: (id: string) => void;
  onClick?: (notification: Notification) => void;
  onAction?: (notification: Notification, action: string, data?: unknown) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  position = 'top-right',
  autoDismissTimeout = 5000,
  onDismiss,
  onClick,
  onAction,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show new notifications
    notifications.forEach((notification) => {
      if (notification.status === 'pending' && !visibleNotifications.has(notification.id)) {
        setVisibleNotifications((prev) => new Set(prev).add(notification.id));

        // Auto-dismiss after timeout
        if (autoDismissTimeout > 0) {
          setTimeout(() => {
            onDismiss(notification.id);
            setVisibleNotifications((prev) => {
              const next = new Set(prev);
              next.delete(notification.id);
              return next;
            });
          }, autoDismissTimeout);
        }
      }
    });

    // Remove dismissed notifications from visible set
    notifications.forEach((notification) => {
      if (notification.status === 'dismissed' && visibleNotifications.has(notification.id)) {
        setVisibleNotifications((prev) => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
      }
    });
  }, [notifications, autoDismissTimeout, onDismiss, visibleNotifications]);

  // Only show pending notifications
  const pendingNotifications = notifications.filter(
    (n) => n.status === 'pending' && visibleNotifications.has(n.id)
  );

  if (pendingNotifications.length === 0) {
    return null;
  }

  const positionClass = `notification-toast-${position}`;

  return (
    <div className={`notification-toast-container ${positionClass}`}>
      {pendingNotifications.map((notification) => (
        <div
          key={notification.id}
          className="notification-toast-item"
          style={{
            animation: 'notification-toast-slide-in 0.3s ease-out',
          }}
        >
          <NotificationItem
            notification={notification}
            onDismiss={onDismiss}
            onClick={onClick}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
};

