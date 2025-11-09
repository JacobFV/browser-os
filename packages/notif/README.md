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

```typescript
import { showNotification, dismissNotification } from '@browser-os/notif';

// Show notification
const id = showNotification('Hello!', {
  body: 'This is a notification',
  icon: 'data:image/png;base64,...',
});

// Dismiss notification
dismissNotification(id);

// Get all notifications
import { notificationManager } from '@browser-os/notif';
const notifications = notificationManager.getAll();
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
  }
});
```

## Permission Model

Apps need `notifications` capability:

```typescript
import { appHost } from '@browser-os/app-host';

if (!appHost.checkCapability(appId, 'notifications')) {
  throw new Error('Permission denied: notifications');
}
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

