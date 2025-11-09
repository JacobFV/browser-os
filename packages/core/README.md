# @browser-os/core

Core utilities, event bus, ID generation, and Zod contracts for browser-os.

## Installation

```bash
pnpm add @browser-os/core
```

## Features

- **Event Bus**: Typed event channels for window, process, filesystem, cursor, and notification events
- **ID Generation**: ULID-based unique ID generation
- **Clock Utilities**: Time and timestamp helpers
- **Zod Schemas**: Type-safe validation contracts for app manifests, window states, and more

## Usage

### Event Bus

```typescript
import { eventBus } from '@browser-os/core';

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

### ID Generation

```typescript
import { createId } from '@browser-os/core';

const id = createId(); // Generates ULID
```

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

