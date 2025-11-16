# IPC/Message Passing API Implementation Plan

## Overview
Add an IPC (Inter-Process Communication) API that provides a higher-level interface for inter-process messaging. While processes already have `os.channel`, this provides a more convenient API for sending messages between processes.

## Architecture

### 1. IPC Syscalls (`packages/kernel/src/syscalls/ipc.ts`)
Create IPC syscall handlers:
- `ipc.send(targetPid, message)` - Send message to specific process, returns void
- `ipc.broadcast(message)` - Broadcast message to all processes, returns void
- `ipc.sendToApp(appId, message)` - Send message to all processes of an app, returns void
- `ipc.onMessage(callback)` - Register message handler (returns handler ID)
- `ipc.offMessage(handlerId)` - Unregister message handler, returns void
- `ipc.getProcesses()` - Get list of running processes, returns ProcessInfo[]

### 2. IPC Manager
- Create an `IPCManager` class that manages inter-process communication
- Use existing Channel system
- Route messages between processes
- Track process subscriptions
- Handle message delivery

### 3. IPC API Class (`packages/proc/src/IPCAPI.ts`)
Create an `IPCAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `send()`, `broadcast()`, `sendToApp()`, `onMessage()`, `offMessage()`, `getProcesses()`
- Handles message subscriptions and callbacks
- Provides typed message handling

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `ipc: IPCAPI`
- Modify `ProcessManager.spawn()` to create an `IPCAPI` instance and add it to `osApi`

## Implementation Details

### Message Format
```typescript
interface IPCMessage {
  from: number; // Source PID
  to?: number; // Target PID (optional for broadcast)
  type: string; // Message type
  data: unknown; // Message payload
  timestamp: number;
}
```

### Process Info
```typescript
interface ProcessInfo {
  pid: number;
  name: string;
  appId: string;
  status: 'running' | 'stopped' | 'terminated';
}
```

### Usage Example
```javascript
// In app code
// Send message to specific process
await os.ipc.send(123, {
  type: 'file-opened',
  data: { path: '/home/user/document.txt' }
});

// Broadcast message to all processes
await os.ipc.broadcast({
  type: 'system-shutdown',
  data: { time: Date.now() + 60000 }
});

// Send message to all processes of an app
await os.ipc.sendToApp('file-browser', {
  type: 'refresh',
  data: {}
});

// Listen for messages
const handlerId = os.ipc.onMessage((message) => {
  console.log(`Received message from PID ${message.from}:`, message.type);
  
  if (message.type === 'file-opened') {
    handleFileOpened(message.data);
  }
});

// Stop listening
os.ipc.offMessage(handlerId);

// Get running processes
const processes = await os.ipc.getProcesses();
processes.forEach(p => {
  console.log(`PID ${p.pid}: ${p.name} (${p.status})`);
});
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/ipc.ts` - IPC syscall handlers
2. `packages/proc/src/IPCAPI.ts` - IPC API class
3. `packages/ipc/src/IPCManager.ts` - IPC manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add IPCManager dependency, register syscalls
2. `packages/kernel/package.json` - Add ipc package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create IPCAPI instance
5. `packages/proc/src/index.ts` - Export IPCAPI

## Considerations

- **Channel Integration**: 
  - Use existing Channel system from `@browser-os/events`
  - Channels are already per-process (`proc:${pid}`)
  - Extend Channel system for IPC routing
  
- **Message Routing**: 
  - Route messages to target processes
  - Handle process termination (don't deliver to dead processes)
  - Queue messages if process is not ready
  
- **Permissions**: 
  - Check if process can send to target
  - Prevent unauthorized message access
  - Consider permission system for IPC
  
- **Message Delivery**: 
  - Guarantee delivery (or provide acknowledgment)
  - Handle message ordering
  - Provide message queuing
  
- **Performance**: 
  - IPC can be high-frequency
  - Optimize message routing
  - Consider message batching
  
- **Event Integration**: 
  - Use EventBus for message delivery
  - Subscribe to process channels
  - Handle process lifecycle events

## Security

- Validate message targets (prevent spoofing)
- Check permissions before message delivery
- Sanitize message data
- Rate limit message sending
- Prevent message loops

## Implementation Strategy

1. Create IPCManager that uses Channel system
2. Route messages via EventBus
3. Track process subscriptions
4. Handle process lifecycle (cleanup on termination)
5. Provide typed message handling
6. Add permission checks

