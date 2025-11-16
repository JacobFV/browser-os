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
      <svg
        className="taskbar-notification-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
    </button>
  );
};

