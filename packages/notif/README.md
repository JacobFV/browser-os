# @browser-os/notif

Notification system for browser-os.

## Installation

```bash
pnpm add @browser-os/notif
```

## Features

- **Notifications**: System notifications with title and body
- **Toasts**: Temporary toast notifications
- **Permission Model**: Request notification permissions
- **Event Integration**: Emits events via event bus

## Usage

### Showing Notifications

```typescript
import { showNotification, dismissNotification } from '@browser-os/notif';

// Show notification
const id = showNotification('Hello!', {
  body: 'This is a notification',
  icon: 'data:image/png;base64,...',
});

// Dismiss notification
dismissNotification(id);
```

### Getting All Notifications

```typescript
import { notificationManager } from '@browser-os/notif';

// Get all notifications
const notifications = notificationManager.getAll();

notifications.forEach(notif => {
  console.log(notif.title, notif.body);
});
```

## Notification Interface

```typescript
interface Notification {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  timestamp: number;
}
```

## Events

Notifications emit events via event bus:

```typescript
import { eventBus } from '@browser-os/core';

eventBus.on('notif', (event) => {
  switch (event.type) {
    case 'show':
      console.log('Notification shown:', event.id, event.title);
      break;
    case 'dismiss':
      console.log('Notification dismissed:', event.id);
      break;
    case 'click':
      console.log('Notification clicked:', event.id);
      break;
  }
});
```

## Permission Model

Apps need `notifications` capability:

```typescript
import { appHost } from '@browser-os/app-host';

function showAppNotification(appId: string, title: string) {
  if (!appHost.checkCapability(appId, 'notifications')) {
    throw new Error('Permission denied: notifications');
  }
  
  return showNotification(title);
}
```

## Toast Notifications

For temporary notifications:

```typescript
import { showNotification } from '@browser-os/notif';

// Show toast (auto-dismisses after 3 seconds)
const id = showNotification('Saved!', {
  body: 'Your changes have been saved',
});

setTimeout(() => {
  dismissNotification(id);
}, 3000);
```

## Notification Manager

```typescript
import { notificationManager } from '@browser-os/notif';

// Get all notifications
const all = notificationManager.getAll();

// Get notifications sorted by timestamp (newest first)
const recent = all.sort((a, b) => b.timestamp - a.timestamp);
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

