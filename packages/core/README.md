# @browser-os/core

Core utilities, event bus, ID generation, and Zod contracts for browser-os.

## Installation

```bash
pnpm add @browser-os/core
```

## Features

- **Event Bus**: Typed event channels for window, process, filesystem, cursor, and notification events
- **ID Generation**: ULID-based unique ID generation with branded types for type safety
- **Clock Utilities**: Time and timestamp helpers
- **Zod Schemas**: Type-safe validation contracts for app manifests, window states, and more
- **DI Container**: Type-safe dependency injection container with compile-time type checking
- **Config Types**: Strict types for app and window configuration

## Usage

### Event Bus

```typescript
import { EventBus } from '@browser-os/core';

// Create an event bus instance
const eventBus = new EventBus();

// Subscribe to window events
const unsubscribe = eventBus.on('window', (event) => {
  if (event.type === 'open') {
    console.log('Window opened:', event.winId);
  }
});

// Emit events
eventBus.emit('window', { type: 'open', winId: 'win-123', appId: 'app-files' });

// Cleanup
unsubscribe();
```

**Note**: EventBus is a class - create instances via dependency injection. Do not use singleton patterns.

### ID Generation

```typescript
import { createId, createWindowId, createAppId, createPid, createWorkspaceId } from '@browser-os/core';

// Generic ID (string)
const id = createId(); // Generates ULID

// Branded types for type safety (prevents mixing different ID types)
const windowId = createWindowId(); // Type: WindowId
const appId = createAppId(); // Type: AppId
const pid = createPid(); // Type: Pid
const workspaceId = createWorkspaceId(); // Type: WorkspaceId
```

**Branded Types**: Branded types (`WindowId`, `AppId`, `Pid`, `WorkspaceId`) provide compile-time type safety to prevent accidentally mixing different ID types. They're compatible with strings but TypeScript will catch type mismatches.

### Clock Utilities

```typescript
import { Clock } from '@browser-os/core';

const now = Clock.now(); // Unix timestamp in ms
const seconds = Clock.nowSeconds(); // Unix timestamp in seconds
const iso = Clock.timestamp(); // ISO string
```

### Zod Schemas

```typescript
import { AppManifestSchema, WindowStateSchema } from '@browser-os/core';

// Validate app manifest
const manifest = AppManifestSchema.parse({
  id: 'my-app',
  name: 'My App',
  version: '1.0.0',
  icon: 'data:image/png;base64,...',
  entry: async () => (await import('./App')).default,
});

// Validate window state
const state = WindowStateSchema.parse('floating');
```

### Dependency Injection Container

```typescript
import { Container } from '@browser-os/core';
import { EventBus } from '@browser-os/core';
import type { ProcessManager } from '@browser-os/process';

// Create container
const container = new Container();

// Register services
container.register('eventBus', new EventBus());
container.register('processManager', processManager);

// Resolve dependencies (type-safe!)
const eventBus = container.resolve('eventBus'); // Type: EventBus
const pm = container.resolve('processManager'); // Type: ProcessManager

// Register factories for lazy initialization
container.registerFactory('vfs', () => new VfsImpl(container.resolve('eventBus')));
```

**Type Safety**: The Container uses a typed `Dependencies` interface, ensuring:
- Only valid dependency keys can be used
- Types are inferred correctly at compile time
- Typos and type mismatches are caught at compile time

### Config Types

```typescript
import type { WindowConfig, AppLaunchConfig, AppConfig } from '@browser-os/core';

// Window configuration
const windowConfig: WindowConfig = {
  title: 'My Window',
  bounds: { x: 100, y: 100, w: 800, h: 600 },
  workspaceId: createWorkspaceId(),
  state: 'floating',
  payload: { customData: 'value' }
};

// App launch configuration
const launchConfig: AppLaunchConfig = {
  ...windowConfig,
  // Additional app-specific options
};
```

## Event Types

### Window Events
- `open` - Window opened
- `close` - Window closed
- `focus` - Window focused
- `blur` - Window blurred
- `move` - Window moved
- `resize` - Window resized
- `minimize` - Window minimized
- `maximize` - Window maximized
- `restore` - Window restored

### Process Events
- `spawn` - Process spawned
- `kill` - Process killed
- `suspend` - Process suspended
- `resume` - Process resumed
- `crash` - Process crashed

### Filesystem Events
- `mount` - Filesystem mounted
- `unmount` - Filesystem unmounted
- `write` - File written
- `delete` - File deleted
- `rename` - File renamed

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

