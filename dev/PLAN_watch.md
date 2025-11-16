# File Watching API Implementation Plan

## Overview
Add a file watching API that allows application processes to watch files and directories for changes. This is essential for editors, file browsers, build tools, and other apps that need to react to filesystem changes.

## Architecture

### 1. Watch Syscalls (`packages/kernel/src/syscalls/watch.ts`)
Create watch syscall handlers:
- `watch.file(path, options?)` - Watch a file for changes, returns WatchHandle
- `watch.directory(path, options?)` - Watch a directory for changes, returns WatchHandle
- `watch.unwatch(handle)` - Stop watching, returns void
- `watch.unwatchAll()` - Stop all watches for this process, returns void

### 2. File Watcher Manager
- Create a `FileWatcherManager` class that manages file watches
- Use polling or EventSource/WebSocket for change detection
- Track watches per process
- Emit events when files change
- Handle file system events from FileSystem

### 3. Watch API Class (`packages/proc/src/WatchAPI.ts`)
Create a `WatchAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `watchFile()`, `watchDirectory()`, `unwatch()`, `unwatchAll()`
- Returns `WatchHandle` objects with `onChange(callback)` method
- Handles watch events via callbacks or channel events

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `watch: WatchAPI`
- Modify `ProcessManager.spawn()` to create a `WatchAPI` instance and add it to `osApi`

## Implementation Details

### Watch Options
```typescript
interface WatchOptions {
  recursive?: boolean; // Watch subdirectories (for directory watches)
  ignoreInitial?: boolean; // Don't emit events for initial state
  debounce?: number; // Debounce events in ms
  filter?: (path: string) => boolean; // Filter which files to watch
}
```

### Watch Handle
```typescript
interface WatchHandle {
  id: string;
  path: string;
  type: 'file' | 'directory';
  onChange(callback: (event: WatchEvent) => void): void;
  unwatch(): Promise<void>;
}

interface WatchEvent {
  type: 'create' | 'update' | 'delete' | 'rename';
  path: string;
  oldPath?: string; // For rename events
  isDirectory: boolean;
  timestamp: number;
}
```

### Usage Example
```javascript
// In app code
// Watch a file
const handle = await os.watch.watchFile('/home/user/document.txt');

handle.onChange((event) => {
  console.log(`File ${event.type}:`, event.path);
  if (event.type === 'update') {
    // Reload file content
    reloadFile(event.path);
  }
});

// Watch a directory
const dirHandle = await os.watch.watchDirectory('/home/user/project', {
  recursive: true,
  ignoreInitial: true,
  filter: (path) => path.endsWith('.js') || path.endsWith('.ts')
});

dirHandle.onChange((event) => {
  console.log(`Change detected: ${event.type} ${event.path}`);
  if (event.type === 'create' && event.path.endsWith('.js')) {
    // New JS file created
  }
});

// Stop watching
await handle.unwatch();

// Stop all watches
await os.watch.unwatchAll();
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/watch.ts` - Watch syscall handlers
2. `packages/proc/src/WatchAPI.ts` - Watch API class
3. `packages/watch/src/FileWatcherManager.ts` - File watcher manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add FileWatcherManager dependency, register syscalls
2. `packages/kernel/package.json` - Add watch package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create WatchAPI instance
5. `packages/proc/src/index.ts` - Export WatchAPI
6. `packages/fs/src/FileSystem.ts` - Emit file system events when files change

## Considerations

- **Change Detection**: 
  - Browser environment doesn't have native file watching
  - Options:
    1. Polling: Periodically check file stats
    2. EventSource/WebSocket: Server-side watching with push notifications
    3. FileSystem events: If FileSystem emits events, listen to them
  
- **Performance**: 
  - Polling can be expensive for many files
  - Use reasonable polling intervals (e.g., 1-5 seconds)
  - Debounce rapid changes
  - Limit number of watches per process
  
- **Event Delivery**: 
  - Events need to be delivered to the process
  - Use EventBus or Channel for event delivery
  - Handle process termination (cleanup watches)
  
- **Permissions**: 
  - Check filesystem permissions before watching
  - Only watch accessible paths
  - Respect filesystem access restrictions
  
- **Recursive Watching**: 
  - For directory watches, optionally watch subdirectories
  - Can be expensive for large directory trees
  - Consider depth limits
  
- **Debouncing**: 
  - Rapid file changes can cause many events
  - Debounce events to reduce noise
  - Configurable debounce delay

## Security

- Validate paths before watching
- Check filesystem permissions
- Limit number of watches per process
- Prevent watching system directories
- Clean up watches on process termination

## Implementation Strategy

1. Create FileWatcherManager with polling mechanism
2. Integrate with FileSystem events if available
3. Use EventBus/Channel for event delivery
4. Track watches per process
5. Clean up watches on process termination
6. Provide debouncing and filtering options

