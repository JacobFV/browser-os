# @browser-os/kernel

Kernel with syscall routing, permissions, and security.

## Overview

The kernel orchestrates all system modules, routes syscalls to appropriate handlers, and enforces security permissions. It initializes the filesystem, process manager, and app registry.

## Usage

```typescript
import { Kernel } from '@browser-os/kernel';

// Create kernel
const kernel = new Kernel();

// Initialize (sets up filesystem, loads config, registers syscalls)
await kernel.init();

// Handle syscall
const response = await kernel.handleSyscall({
  id: crypto.randomUUID(),
  syscall: 'fs.read',
  args: { path: '/home/user/file.txt' },
  pid: 123,
});

// Get module instances
const fs = kernel.getFS();
const procManager = kernel.getProcessManager();
const appRegistry = kernel.getAppRegistry();
const eventBus = kernel.getEventBus();

// Set permissions for a process
kernel.setPermissions(pid, {
  allowedSyscalls: ['fs.read', 'fs.write'],
  fsAccess: ['/home/user/**', '/tmp/**'],
});

// Get security context
const context = kernel.getSecurityContext(pid);
```

## Initialization Sequence

1. Initialize filesystem with default mounts
2. Create default directory structure
3. Load system configuration from `/etc/config.json`
4. Load app registry from `/etc/registry.json`
5. Register syscall handlers (fs, proc, registry)
6. Set up default permissions
7. Emit `kernel:ready` event

## Syscalls

### Filesystem
- `fs.read(path)` - Read file
- `fs.write(path, data)` - Write file
- `fs.delete(path)` - Delete file
- `fs.mkdir(path)` - Create directory
- `fs.rmdir(path)` - Remove directory
- `fs.readdir(path)` - List directory
- `fs.stat(path)` - Get file metadata
- `fs.exists(path)` - Check if path exists

### Process
- `proc.spawn(appId, args, options)` - Spawn process
- `proc.kill(pid, signal)` - Kill process
- `proc.list()` - List all processes
- `proc.get(pid)` - Get process info

### Registry
- `registry.list(enabled?)` - List apps
- `registry.get(appId)` - Get app info
- `registry.isInstalled(appId)` - Check if installed

## Security

- Default deny: processes must have explicit permissions
- Permission checks before every syscall
- Filesystem access restricted to allowed paths
- Process isolation via security contexts

