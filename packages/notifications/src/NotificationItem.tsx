import React from 'react';
import type { Notification } from '@browser-os/schemas';
import './NotificationItem.css';

export interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick?: (notification: Notification) => void;
  onAction?: (notification: Notification, action: string, data?: unknown) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  onClick,
  onAction,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const handleAction = (action: string, data?: unknown) => {
    if (onAction) {
      onAction(notification, action, data);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) {
      // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) {
      // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const priorityClass = `notification-item-priority-${notification.priority}`;
  const statusClass = `notification-item-status-${notification.status}`;

  return (
    <div
      className={`notification-item ${priorityClass} ${statusClass}`}
      onClick={handleClick}
    >
      {notification.icon && (
        <div className="notification-item-icon">
          <img src={notification.icon} alt={notification.appId || 'Notification'} />
        </div>
      )}
      <div className="notification-item-content">
        <div className="notification-item-header">
          <div className="notification-item-title">{notification.title}</div>
          <button
            className="notification-item-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <div className="notification-item-message">{notification.message}</div>
        <div className="notification-item-footer">
          <div className="notification-item-timestamp">
            {formatTimestamp(notification.createdAt)}
          </div>
          {notification.actions && notification.actions.length > 0 && (
            <div className="notification-item-actions">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className="notification-item-action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(action.action, action.data);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

