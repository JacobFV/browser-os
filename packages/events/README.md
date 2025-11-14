# @browser-os/events

Event bus system for IPC and pub/sub communication.

## Overview

Provides a centralized event bus for inter-process communication and general event publishing/subscribing. IPC is implemented using the event bus but the bus supports many other use cases.

## Core Classes

### EventBus

Main event bus singleton/factory.

```typescript
import { EventBus } from '@browser-os/events';

const bus = new EventBus();

// Subscribe to events
const unsubscribe = bus.on('app:installed', (event) => {
  console.log('App installed:', event.payload);
});

// Emit events
bus.emit('app:installed', { appId: 'my-app' });

// Request-response pattern
const response = await bus.request('get:config', { key: 'theme' });
```

### Channel

Named communication channel for IPC.

```typescript
import { Channel } from '@browser-os/events';

const channel = new Channel('my-process', bus);

// Send message
channel.send('message', { data: 'hello' });

// Listen for messages
channel.on('message', (payload) => {
  console.log('Received:', payload);
});

// Request-response
const result = await channel.request('get:data', { id: 123 });
```

## Event Types

- `ipc:<pid>:<type>` - IPC between processes
- `syscall:<syscall>` - Syscall events
- `fs:<operation>` - Filesystem events
- `proc:<pid>:<event>` - Process lifecycle events
- `kernel:<event>` - Kernel events

