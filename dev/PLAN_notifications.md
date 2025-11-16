# Notifications API Implementation Plan

## Overview
Add a notifications API that allows application processes to create, manage, and interact with system notifications. The NotificationManager already exists in the system, so this primarily involves exposing it via syscalls and creating an OO API wrapper.

## Architecture

### 1. Notification Syscalls (`packages/kernel/src/syscalls/notification.ts`)
Create notification syscall handlers:
- `notification.create(options)` - Create a notification, returns notificationId
- `notification.dismiss(id)` - Dismiss a notification
- `notification.dismissAll()` - Dismiss all notifications for this app
- `notification.markAsRead(id)` - Mark notification as read
- `notification.markAllAsRead()` - Mark all notifications as read
- `notification.getUnreadCount()` - Get unread count for this app
- `notification.getNotifications(filter?)` - Get notifications (all/unread/dismissed)

### 2. Kernel Integration
- Modify `Kernel` constructor to accept `NotificationManager` (or inject it via options)
- Register notification syscalls in `Kernel.registerSyscalls()`
- Add notification syscalls to default permissions in `setupDefaultPermissions()`

### 3. Notification API Class (`packages/proc/src/NotificationAPI.ts`)
Create a `NotificationAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `show()`, `dismiss()`, `dismissAll()`, `markAsRead()`, `markAllAsRead()`, `getUnreadCount()`, `getNotifications()`
- Returns `Notification` objects with properties: `id`, `title`, `message`, `priority`, `status`, `createdAt`, `actions`
- Handles notification actions via callbacks or events

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `notification: NotificationAPI`
- Modify `ProcessManager.spawn()` to create a `NotificationAPI` instance and add it to `osApi`

## Implementation Details

### Notification Options
```typescript
interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  actions?: Array<{
    label: string;
    action: string;
    data?: unknown;
  }>;
  icon?: string; // URL or path to icon
  sound?: boolean;
  persistent?: boolean; // Don't auto-dismiss
}
```

### Notification Object
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'read' | 'dismissed';
  createdAt: number;
  appId: string;
  actions?: Array<{
    label: string;
    action: string;
    data?: unknown;
  }>;
}
```

### Usage Example
```javascript
// In app code
const notification = await os.notification.show({
  title: 'Download Complete',
  message: 'file.zip has finished downloading',
  priority: 'normal',
  actions: [
    { label: 'Open', action: 'open-file', data: { path: '/downloads/file.zip' } },
    { label: 'Dismiss', action: 'dismiss' }
  ]
});

// Get unread count
const count = await os.notification.getUnreadCount();

// Get all notifications
const notifications = await os.notification.getNotifications('unread');

// Mark as read
await os.notification.markAsRead(notification.id);

// Dismiss
await os.notification.dismiss(notification.id);
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/notification.ts` - Notification syscall handlers
2. `packages/proc/src/NotificationAPI.ts` - Notification API class

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add NotificationManager dependency, register syscalls
2. `packages/kernel/package.json` - Add `@browser-os/notifications` dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create NotificationAPI instance
5. `packages/proc/src/index.ts` - Export NotificationAPI

## Considerations

- **Permissions**: Check if app has permission to send notifications (use NotificationManager's permission system)
- **App ID**: Automatically associate notifications with the process's appId
- **Action Handling**: Notification actions should be handled via events or callbacks - consider how apps can respond to actions
- **Rate Limiting**: Consider rate limiting to prevent notification spam
- **Persistence**: Notifications are already persisted by NotificationManager
- **Event Bus**: NotificationManager uses EventBus - ensure syscalls properly integrate with it

## Security

- Only allow processes to create/dismiss their own notifications (check appId)
- Respect notification permissions set by NotificationManager
- Validate notification options (title/message length limits, etc.)

