# @browser-os/proc

Process lifecycle management.

## Overview

Manages process spawning, execution, communication, and termination. Processes run app code in a sandboxed environment with controlled access to system resources.

## Usage

```typescript
import { ProcessManager } from '@browser-os/proc';
import { EventBus } from '@browser-os/events';
import { FileSystem } from '@browser-os/fs';

const eventBus = new EventBus();
const fs = new FileSystem();
const procManager = new ProcessManager({
  eventBus,
  fs,
  syscallHandler: async (pid, syscall, args) => {
    // Handle syscalls
    return result;
  },
});

// Spawn a process
const process = await procManager.spawn('my-app', ['arg1', 'arg2'], {
  cwd: '/home/user',
  env: { NODE_ENV: 'production' },
});

// Get process info
const proc = procManager.get(process.pid);
const allProcs = procManager.list();

// Kill a process
await procManager.kill(process.pid, 'SIGTERM');

// Get IPC channel
const channel = procManager.getChannel(process.pid);
```

## Process Execution

Apps are JavaScript code stored in `/bin/<app-id>.js`. When spawned:

1. App code is loaded from filesystem
2. Process instance is created with PID
3. IPC channel is created
4. Code is executed in sandboxed environment with `os` API
5. Process runs until termination

## Sandboxed API

Apps receive an `os` object with:

```typescript
interface OSAPI {
  pid: number;
  cwd: string;
  env: Record<string, string>;
  syscall(name: string, args: Record<string, unknown>): Promise<unknown>;
  channel: Channel;
}
```

