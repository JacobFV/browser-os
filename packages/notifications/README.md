# @browser-os/notifications

Notification subsystem for Browser OS.

## Overview

Provides notification management, display components, persistence, and settings for the Browser OS.

## Features

- Create and manage notifications
- Toast-style notifications with auto-dismiss
- Notification center with filtering and search
- Notification badges for unread counts
- Persistent storage with retention policies
- Per-app notification permissions
- Do not disturb mode
- Quiet hours
- Event bus integration

## Usage

### Creating Notifications

```typescript
import { NotificationManager } from '@browser-os/notifications';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const notificationManager = new NotificationManager({ eventBus });

// Create a notification
notificationManager.createNotification({
  title: 'Download Complete',
  message: 'file.zip has finished downloading',
  appId: 'file-browser',
  priority: 'normal',
  actions: [
    { label: 'Open', action: 'open-file', data: { path: '/downloads/file.zip' } }
  ]
});
```

### Using React Components

```typescript
import { NotificationCenter, NotificationToast, NotificationBadge } from '@browser-os/notifications';
import { useNotifications } from '@browser-os/notifications';

function MyComponent({ notificationManager }) {
  const { notifications, unreadCount } = useNotifications({ notificationManager });

  return (
    <>
      <NotificationBadge count={unreadCount} />
      <NotificationCenter notificationManager={notificationManager} />
      <NotificationToast 
        notifications={notifications}
        notificationManager={notificationManager}
      />
    </>
  );
}
```

### Event Bus Integration

```typescript
// Emit notification creation event
eventBus.emit('notification:create', {
  title: 'System Update',
  message: 'New update available',
  priority: 'high'
});
```

## API

### NotificationManager

- `createNotification(options)`: Create a notification
- `dismissNotification(id)`: Dismiss a notification
- `dismissAll()`: Dismiss all notifications
- `markAsRead(id)`: Mark notification as read
- `markAllAsRead()`: Mark all as read
- `getNotifications()`: Get all notifications
- `getUnreadCount()`: Get unread count
- `clearHistory()`: Clear notification history
- `subscribe(callback)`: Subscribe to changes
- `getSettings()`: Get notification settings
- `updateSettings(updates)`: Update settings

### Components

- `NotificationCenter`: Main notification center UI
- `NotificationItem`: Individual notification display
- `NotificationToast`: Toast-style notifications
- `NotificationBadge`: Badge showing unread count
- `NotificationSettings`: Settings UI

### Hooks

- `useNotifications(options)`: React hook for notification state

