import React from 'react';
import type { NotificationManager } from '@browser-os/notifications';
import { NotificationBadge } from '@browser-os/notifications';
import { useNotifications } from '@browser-os/notifications';
import './NotificationBadgeButton.css';

export interface NotificationBadgeButtonProps {
  notificationManager: NotificationManager;
  onClick: () => void;
}

export const NotificationBadgeButton: React.FC<NotificationBadgeButtonProps> = ({
  notificationManager,
  onClick,
}) => {
  const { unreadCount } = useNotifications({ notificationManager });

  return (
    <button className="taskbar-notification-button" onClick={onClick} title="Notifications">
      <span className="taskbar-notification-icon">🔔</span>
      {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
    </button>
  );
};

