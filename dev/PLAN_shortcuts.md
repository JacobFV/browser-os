# Keyboard Shortcuts API Implementation Plan

## Overview
Add a keyboard shortcuts API that allows application processes to register global and app-scoped keyboard shortcuts. This enables apps to respond to key combinations like Ctrl+S, Alt+F4, etc.

## Architecture

### 1. Shortcuts Syscalls (`packages/kernel/src/syscalls/shortcuts.ts`)
Create shortcuts syscall handlers:
- `shortcuts.register(shortcut, callback, options?)` - Register keyboard shortcut, returns ShortcutHandle
- `shortcuts.unregister(handle)` - Unregister shortcut, returns void
- `shortcuts.unregisterAll()` - Unregister all shortcuts for this process, returns void
- `shortcuts.list()` - List registered shortcuts for this process, returns ShortcutInfo[]

### 2. Shortcuts Manager
- Create a `ShortcutsManager` class that manages keyboard shortcuts
- Track shortcuts per process
- Handle key combinations
- Resolve shortcut conflicts
- Emit shortcut events

### 3. Shortcuts API Class (`packages/proc/src/ShortcutsAPI.ts`)
Create a `ShortcutsAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `register()`, `unregister()`, `unregisterAll()`, `list()`
- Returns `ShortcutHandle` objects
- Handles shortcut callbacks

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `shortcuts: ShortcutsAPI`
- Modify `ProcessManager.spawn()` to create a `ShortcutsAPI` instance and add it to `osApi`

## Implementation Details

### Shortcut Format
```typescript
type Shortcut = string; // e.g., "Ctrl+S", "Alt+F4", "Ctrl+Shift+N"

interface ShortcutOptions {
  global?: boolean; // Global shortcut (works outside app) vs app-scoped
  preventDefault?: boolean; // Prevent default browser behavior
  priority?: number; // Priority for conflict resolution (higher = wins)
}
```

### Shortcut Handle
```typescript
interface ShortcutHandle {
  id: string;
  shortcut: string;
  global: boolean;
  unregister(): Promise<void>;
}
```

### Shortcut Info
```typescript
interface ShortcutInfo {
  id: string;
  shortcut: string;
  global: boolean;
  priority: number;
}
```

### Usage Example
```javascript
// In app code
// Register app-scoped shortcut
const handle = await os.shortcuts.register('Ctrl+S', () => {
  console.log('Save triggered');
  saveDocument();
}, {
  preventDefault: true
});

// Register global shortcut
const globalHandle = await os.shortcuts.register('Ctrl+Shift+N', () => {
  console.log('New window triggered');
  createNewWindow();
}, {
  global: true,
  priority: 100
});

// List registered shortcuts
const shortcuts = await os.shortcuts.list();
shortcuts.forEach(s => {
  console.log(`${s.shortcut} (${s.global ? 'global' : 'app'})`);
});

// Unregister shortcut
await handle.unregister();

// Unregister all shortcuts
await os.shortcuts.unregisterAll();
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/shortcuts.ts` - Shortcuts syscall handlers
2. `packages/proc/src/ShortcutsAPI.ts` - Shortcuts API class
3. `packages/shortcuts/src/ShortcutsManager.ts` - Shortcuts manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add ShortcutsManager dependency, register syscalls
2. `packages/kernel/package.json` - Add shortcuts package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create ShortcutsAPI instance
5. `packages/proc/src/index.ts` - Export ShortcutsAPI
6. `packages/os/src/OS.tsx` - Add keyboard event listener for shortcuts

## Considerations

- **Key Parsing**: 
  - Parse shortcut strings like "Ctrl+S", "Alt+F4"
  - Support modifiers: Ctrl, Alt, Shift, Meta
  - Support special keys: F1-F12, Enter, Escape, etc.
  - Case-insensitive key names
  
- **Conflict Resolution**: 
  - Multiple processes can register same shortcut
  - Use priority system (higher priority wins)
  - Global shortcuts take precedence over app-scoped
  - Notify user of conflicts
  
- **Event Handling**: 
  - Listen to keyboard events at OS level
  - Route events to registered shortcuts
  - Handle focus (app-scoped shortcuts only when app focused)
  
- **Global vs App-Scoped**: 
  - Global shortcuts work everywhere
  - App-scoped shortcuts only when app window focused
  - Track focused window/process
  
- **Browser Limitations**: 
  - Some shortcuts are reserved by browser (Ctrl+T, Ctrl+W, etc.)
  - Can't override browser shortcuts
  - Document limitations
  
- **Cleanup**: 
  - Unregister shortcuts on process termination
  - Clean up event listeners
  - Prevent memory leaks

## Security

- Validate shortcut strings
- Prevent registration of system shortcuts
- Rate limit shortcut registration
- Check permissions for global shortcuts
- Sanitize shortcut callbacks

## Implementation Strategy

1. Create ShortcutsManager that listens to keyboard events
2. Parse shortcut strings
3. Track shortcuts per process
4. Resolve conflicts by priority
5. Route events to registered shortcuts
6. Clean up on process termination
7. Integrate with window focus system

