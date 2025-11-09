# @browser-os/process

Process management system with lifecycle, IPC, and monitoring for browser-os.

## Installation

```bash
pnpm add @browser-os/process
```

## Features

- **Process Lifecycle**: starting → running → suspended → stopped → crashed
- **Process Spawning**: Create processes from app IDs
- **IPC System**: Topic-based inter-process communication
- **Process Monitoring**: CPU and memory tracking
- **Process Table**: Query and manage running processes

## Usage

### Spawning Processes

```typescript
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';

// Create instances via dependency injection
const eventBus = new EventBus();
const processManager = new ProcessManager(eventBus);

// Spawn a process
const pid = processManager.spawnApp('my-app');

// Get process info
const process = processManager.getProcess(pid);
console.log(process.state); // 'running'
console.log(process.appId);
console.log(process.startedAt);

// Kill a process
processManager.kill(pid);
```

**Note**: ProcessManager is a class - create instances via dependency injection. Do not use singleton patterns.

### Process States

```typescript
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const processManager = new ProcessManager(eventBus);

const pid = processManager.spawnApp('my-app');

// Suspend process (freeze timers/render)
processManager.suspend(pid);

// Resume process
processManager.resume(pid);

// Check state
const proc = processManager.getProcess(pid);
console.log(proc.state); // 'suspended' or 'running'
```

### Inter-Process Communication (IPC)

```typescript
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const processManager = new ProcessManager(eventBus);

const pid = processManager.spawnApp('my-app');

// Register IPC handler
const proc = processManager.getProcess(pid);
proc.channels['custom-topic'] = (msg) => {
  console.log('Received:', msg);
};

// Send message to process
processManager.send(pid, 'custom-topic', { data: 'hello' });
```

### Process Monitoring

```typescript
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();
const processManager = new ProcessManager(eventBus);

// Get all processes
const processes = processManager.getAllProcesses();

processes.forEach(proc => {
  console.log(`${proc.appId} (${proc.pid}):`, {
    state: proc.state,
    cpu: proc.cpu, // CPU usage percentage
    mem: proc.mem, // Memory usage in bytes
    uptime: Date.now() - proc.startedAt,
  });
});
```

## Process Lifecycle

```
starting → running → (suspended | stopped | crashed)
```

- **starting**: Process is being initialized
- **running**: Process is active and executing
- **suspended**: Process is paused (minimized/inactive)
- **stopped**: Process was terminated normally
- **crashed**: Process encountered an error

## Events

Process events are emitted via the event bus:

```typescript
import { EventBus } from '@browser-os/core';

const eventBus = new EventBus();

eventBus.on('proc', (event) => {
  switch (event.type) {
    case 'spawn':
      console.log('Process spawned:', event.pid, event.appId);
      break;
    case 'kill':
      console.log('Process killed:', event.pid);
      break;
    case 'suspend':
      console.log('Process suspended:', event.pid);
      break;
    case 'resume':
      console.log('Process resumed:', event.pid);
      break;
    case 'crash':
      console.error('Process crashed:', event.pid, event.error);
      break;
  }
});
```

## Process Interface

```typescript
interface Process {
  pid: string;
  appId: string;
  state: 'starting' | 'running' | 'suspended' | 'stopped' | 'crashed';
  startedAt: number;
  cpu?: number; // CPU usage percentage
  mem?: number; // Memory usage in bytes
  channels: Record<string, (msg: any) => void>; // IPC handlers
}
```

## Scheduler

The process manager includes a cooperative scheduler:
- Uses `requestAnimationFrame` for rendering budget
- Deprioritizes hidden/minimized windows
- Task queue for background operations

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

