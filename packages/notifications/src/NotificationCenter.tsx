import React, { useState, useMemo } from 'react';
import type { Notification } from '@browser-os/schemas';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from './useNotifications';
import type { NotificationManager } from './NotificationManager';
import './NotificationCenter.css';

export interface NotificationCenterProps {
  notificationManager: NotificationManager;
  onClose?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationAction?: (notification: Notification, action: string, data?: unknown) => void;
}

type FilterType = 'all' | 'unread' | 'dismissed';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notificationManager,
  onClose,
  onNotificationClick,
  onNotificationAction,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, dismissAll } =
    useNotifications({ notificationManager });
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply status filter
    if (filter === 'unread') {
      filtered = filtered.filter((n) => n.status === 'pending');
    } else if (filter === 'dismissed') {
      filtered = filtered.filter((n) => n.status === 'dismissed');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [notifications, filter, searchQuery]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'pending') {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleNotificationAction = (notification: Notification, action: string, data?: unknown) => {
    if (onNotificationAction) {
      onNotificationAction(notification, action, data);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      dismissAll();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="notification-center">
      <div className="notification-center-header">
        <div className="notification-center-title">
          Notifications
          {unreadCount > 0 && (
            <span className="notification-center-unread-count">{unreadCount}</span>
          )}
        </div>
        <button className="notification-center-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="notification-center-toolbar">
        <div className="notification-center-filters">
          <button
            className={`notification-center-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`notification-center-filter ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {unreadCount > 0 && (
              <span className="notification-center-filter-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className={`notification-center-filter ${filter === 'dismissed' ? 'active' : ''}`}
            onClick={() => setFilter('dismissed')}
          >
            Dismissed
          </button>
        </div>

        <div className="notification-center-actions">
          {unreadCount > 0 && (
            <button
              className="notification-center-action-button"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notification-center-action-button" onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notification-center-search">
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="notification-center-search-input"
        />
      </div>

      <div className="notification-center-content">
        {filteredNotifications.length === 0 ? (
          <div className="notification-center-empty">
            {searchQuery ? 'No notifications match your search' : 'No notifications'}
          </div>
        ) : (
          <div className="notification-center-list">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={dismiss}
                onClick={handleNotificationClick}
                onAction={handleNotificationAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

