# @browser-os/fs

Virtual filesystem with multiple backend drivers.

## Overview

Provides a unified filesystem interface with support for multiple storage backends (localStorage, IndexedDB, server, ephemeral memory). Supports mount points and a Unix-like directory structure.

## Filesystem Structure

```
/
├── bin/          # Executable apps
├── etc/          # System configuration
├── home/         # User home directories
│   └── <user>/
│       ├── Documents/
│       ├── Downloads/
│       ├── Videos/
│       ├── Pictures/
│       ├── Music/
│       └── Desktop/
├── tmp/          # Temporary files (ephemeral)
├── var/          # Variable data
│   ├── log/      # Logs
│   └── cache/    # Cache
└── sys/          # System information
```

## Usage

```typescript
import { FileSystem, IndexedDBBackend, EphemeralBackend } from '@browser-os/fs';

const fs = new FileSystem();

// Mount backends
const rootBackend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
await rootBackend.init();
await fs.mount('/', rootBackend);

const tmpBackend = new EphemeralBackend();
await fs.mount('/tmp', tmpBackend);

// File operations
await fs.write('/home/user/file.txt', new TextEncoder().encode('Hello'));
const data = await fs.read('/home/user/file.txt');
const exists = await fs.exists('/home/user/file.txt');

// Directory operations
await fs.mkdir('/home/user/Documents', { recursive: true });
const entries = await fs.readdir('/home/user');
const stat = await fs.stat('/home/user/file.txt');
```

## Backends

- **IndexedDBBackend**: Persistent storage with large capacity
- **LocalStorageBackend**: Persistent storage with limited capacity
- **EphemeralBackend**: In-memory storage (cleared on reload)
- **ServerBackend**: HTTP API backend

