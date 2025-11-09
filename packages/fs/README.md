# @browser-os/fs

Virtual filesystem (VFS) abstraction with multiple backend drivers for browser-os.

## Installation

```bash
pnpm add @browser-os/fs
```

## Features

- **Virtual Filesystem**: Unified `vfs://` URI scheme
- **Multiple Drivers**: Memory, IndexedDB, OPFS, localStorage
- **Mount System**: Mount drivers at specific mount points
- **File Watching**: Event-based file system watching
- **Quota Management**: Per-driver quota tracking

## Usage

### Mounting a Driver

```typescript
import { VfsImpl, createMemDriver, createIdbDriver } from '@browser-os/fs';
import { EventBus } from '@browser-os/core';

// Create VFS instance via dependency injection
const eventBus = new EventBus();
const vfs = new VfsImpl(eventBus);

// Mount memory driver
const memDriver = createMemDriver();
vfs.mount({
  mountPoint: '/home',
  driver: memDriver,
});

// Mount IndexedDB driver
const idbDriver = createIdbDriver();
vfs.mount({
  mountPoint: '/data',
  driver: idbDriver,
});
```

**Note**: VfsImpl is a class - create instances via dependency injection. Do not use singleton patterns.

### Reading and Writing Files

```typescript
import { VfsImpl } from '@browser-os/fs';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const vfs = new VfsImpl(eventBus);

// Write a file
await vfs.write('vfs://home/documents/readme.txt', 'Hello, World!');

// Read a file
const content = await vfs.read('vfs://home/documents/readme.txt', { binary: false });

// Read binary file
const binary = await vfs.read('vfs://home/images/photo.png', { binary: true });
```

### File Operations

```typescript
import { VfsImpl } from '@browser-os/fs';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const vfs = new VfsImpl(eventBus);

// Get file stats
const stat = await vfs.stat('vfs://home/documents/readme.txt');
console.log(stat.type); // 'file' or 'directory'
console.log(stat.size);
console.log(stat.mtime);

// List directory
const entries = await vfs.readdir('vfs://home/documents');
entries.forEach(entry => {
  console.log(entry.name, entry.path, entry.stat);
});

// Delete file
await vfs.rm('vfs://home/documents/old.txt');

// Delete directory (recursive)
await vfs.rm('vfs://home/documents', { recursive: true });
```

### File Watching

```typescript
import { VfsImpl } from '@browser-os/fs';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const vfs = new VfsImpl(eventBus);

// Watch a file or directory
const unwatch = vfs.watch('vfs://home/documents', (event) => {
  console.log('File system event:', event.type, event.path);
});

// Stop watching
unwatch();
```

## URI Scheme

All files use the `vfs://` URI scheme:

```
vfs://<mount-point>/<path>
```

Examples:
- `vfs://home/documents/file.txt`
- `vfs://data/apps/config.json`
- `vfs://temp/cache/data.bin`

## Drivers

### Memory Driver

In-memory filesystem, perfect for temporary data:

```typescript
import { createMemDriver } from '@browser-os/fs';

const driver = createMemDriver();
// Data is lost on page reload
```

### IndexedDB Driver

Persistent storage using IndexedDB:

```typescript
import { createIdbDriver } from '@browser-os/fs';

const driver = createIdbDriver();
// Data persists across sessions
```

### OPFS Driver

Origin Private File System (Chrome/Edge):

```typescript
import { createOpfsDriver } from '@browser-os/fs';

const driver = createOpfsDriver();
// High-performance file system access
```

## Creating Custom Drivers

```typescript
import { FsDriver } from '@browser-os/fs';

const customDriver: FsDriver = {
  id: 'custom',
  scheme: 'custom:',
  async stat(path: string) {
    // Return file stats
  },
  async read(path: string, opts?: { binary?: boolean }) {
    // Read file content
  },
  async write(path: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }) {
    // Write file content
  },
  async rm(path: string, opts?: { recursive?: boolean }) {
    // Delete file/directory
  },
  async readdir(path: string) {
    // List directory contents
  },
  watch(path: string, cb: (ev: FsEvent) => void) {
    // Return unwatch function
  },
};

vfs.mount({ mountPoint: '/custom', driver: customDriver });
```

**Note**: Replace `vfs` with your VfsImpl instance created via dependency injection.

## Events

Filesystem events are emitted via the event bus:

```typescript
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();

eventBus.on('fs', (event) => {
  switch (event.type) {
    case 'mount':
      console.log('Mounted:', event.mountPoint);
      break;
    case 'write':
      console.log('File written:', event.path);
      break;
    // ... other event types
  }
});
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

