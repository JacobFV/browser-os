# @browser-os/windowing

Window management system for browser-os with object-oriented Window class and shared control between Apps and OS.

## Installation

```bash
pnpm add @browser-os/windowing
```

## Architecture

### Window Class

Windows are instances of the `Window` class that can be controlled by both Apps and the OS:

```typescript
import { Window } from '@browser-os/windowing';

// Create a window
const window = new Window(
  'my-app',           // appId
  'My Window',        // title
  { x: 100, y: 100, w: 800, h: 600 }, // bounds
  'default',          // workspaceId
  { data: 'value' }   // payload
);

// Modify window properties
window.setTitle('New Title', 'app');
window.moveTo(200, 200, 'app');
window.resizeTo(1000, 700, 'app');
window.maximize('os');
window.minimize('os');
window.restore('os');
```

### Shared Control

Both Apps and OS can modify window properties:

```typescript
// From App
window.setTitle('App Title', 'app');
window.setX(100, 'app');
window.setY(100, 'app');

// From OS/WindowManager
window.setTitle('OS Title', 'os');
window.maximize('os');
window.moveTo(0, 0, 'os');
```

All changes are synchronized via the event bus.

### WindowManager

Manages windows and provides OS-level control:

```typescript
import { windowManager } from '@browser-os/windowing';

// Register a window created by an app
windowManager.registerWindow(window);

// OS-level operations
windowManager.focusWindow(window.id);
windowManager.moveWindow(window.id, 100, 100);
windowManager.resizeWindow(window.id, 800, 600);
windowManager.minimizeWindow(window.id);
windowManager.maximizeWindow(window.id);
windowManager.restoreWindow(window.id);
windowManager.closeWindow(window.id);

// Query windows
const windows = Array.from(windowManager.windows.values());
const focusedWindow = windowManager.windows.get(windowManager.focusedWindowId);
const workspaceWindows = windowManager.getWindowsForWorkspace('workspace-1');
```

## Window States

Windows can be in different states:

- `floating`: Normal window that can be moved/resized
- `minimized`: Window minimized to taskbar
- `maximized`: Window fills screen
- `fullscreen`: Window in fullscreen mode
- `docked`: Window docked to editor layout

```typescript
window.setState('maximized', 'os');
window.setState('minimized', 'os');
window.setState('floating', 'os');
```

## Window Properties

### Getters

```typescript
window.id          // string - Unique window ID
window.appId       // string - App ID that owns this window
window.title       // string - Window title
window.state       // WindowState - Current state
window.bounds      // WindowBounds - { x, y, w, h }
window.workspaceId // string - Workspace ID
window.z           // number - Z-index
window.payload     // Record<string, any> | undefined - Custom data
```

### Setters

```typescript
window.setTitle(title: string, source: 'app' | 'os'): void
window.setState(state: WindowState, source: 'app' | 'os'): void
window.setBounds(bounds: Partial<WindowBounds>, source: 'app' | 'os'): void
window.setX(x: number, source: 'app' | 'os'): void
window.setY(y: number, source: 'app' | 'os'): void
window.setWidth(w: number, source: 'app' | 'os'): void
window.setHeight(h: number, source: 'app' | 'os'): void
window.setWorkspaceId(workspaceId: string, source: 'app' | 'os'): void
window.setZ(z: number, source: 'app' | 'os'): void
window.setPayload(payload: Record<string, any>, source: 'app' | 'os'): void
```

### Convenience Methods

```typescript
window.minimize(source: 'app' | 'os'): void
window.maximize(source: 'app' | 'os'): void
window.restore(source: 'app' | 'os'): void
window.moveTo(x: number, y: number, source: 'app' | 'os'): void
window.resizeTo(w: number, h: number, source: 'app' | 'os'): void
```

## WindowView Component

React component for rendering windows:

```typescript
import { WindowView } from '@browser-os/windowing';

<WindowView
  window={window}
  onClose={(winId) => appManager.closeWindow(winId)}
  onFocus={(winId) => windowManager.focusWindow(winId)}
  onMove={(winId, x, y) => window.moveTo(x, y, 'os')}
  onResize={(winId, w, h) => window.resizeTo(w, h, 'os')}
  onMinimize={(winId) => window.minimize('os')}
  onMaximize={(winId) => window.maximize('os')}
  onRestore={(winId) => window.restore('os')}
>
  {/* Window content */}
</WindowView>
```

## Events

Window changes emit events via the event bus:

```typescript
import { eventBus } from '@browser-os/core';

eventBus.on('window', (event) => {
  switch (event.type) {
    case 'open':
      console.log('Window opened:', event.winId);
      break;
    case 'close':
      console.log('Window closed:', event.winId);
      break;
    case 'focus':
      console.log('Window focused:', event.winId);
      break;
    case 'move':
      console.log('Window moved:', event.winId, event.x, event.y);
      break;
    case 'resize':
      console.log('Window resized:', event.winId, event.w, event.h);
      break;
    case 'minimize':
      console.log('Window minimized:', event.winId);
      break;
    case 'maximize':
      console.log('Window maximized:', event.winId);
      break;
    case 'restore':
      console.log('Window restored:', event.winId);
      break;
    case 'update':
      console.log('Window updated:', event.winId);
      break;
  }
});
```

## Window Arrangement

Arrange windows in preset patterns:

```typescript
import { arrangeWindows } from '@browser-os/windowing';

// Grid layout (2x2)
arrangeWindows('grid-2x2');

// Stack layout (main + sidebar)
arrangeWindows('stack-right');

// Monocle (all windows fullscreen)
arrangeWindows('monocle');
```

## Workspace Support

Windows belong to workspaces:

```typescript
// Create window in specific workspace
const window = new Window('my-app', 'Title', bounds, 'workspace-1');

// Get windows for workspace
const workspaceWindows = windowManager.getWindowsForWorkspace('workspace-1');

// Move window to different workspace
window.setWorkspaceId('workspace-2', 'os');
```

## API Reference

### Window Class

```typescript
class Window {
  readonly id: string;
  readonly appId: string;
  
  get title(): string;
  get state(): WindowState;
  get bounds(): WindowBounds;
  get workspaceId(): string;
  get z(): number;
  get payload(): Record<string, any> | undefined;
  
  setTitle(title: string, source: 'app' | 'os'): void;
  setState(state: WindowState, source: 'app' | 'os'): void;
  setBounds(bounds: Partial<WindowBounds>, source: 'app' | 'os'): void;
  minimize(source: 'app' | 'os'): void;
  maximize(source: 'app' | 'os'): void;
  restore(source: 'app' | 'os'): void;
  moveTo(x: number, y: number, source: 'app' | 'os'): void;
  resizeTo(w: number, h: number, source: 'app' | 'os'): void;
  toJSON(): WindowData;
}
```

### WindowManager

```typescript
class WindowManager {
  windows: Map<string, Window>;
  focusedWindowId: string | null;
  nextZ: number;
  
  openWindow(options: WindowOptions): Window;
  registerWindow(window: Window): void;
  closeWindow(winId: string): void;
  focusWindow(winId: string): void;
  moveWindow(winId: string, x: number, y: number): void;
  resizeWindow(winId: string, w: number, h: number): void;
  minimizeWindow(winId: string): void;
  maximizeWindow(winId: string): void;
  restoreWindow(winId: string): void;
  setWindowState(winId: string, state: WindowState): void;
  updateWindowTitle(winId: string, title: string): void;
  getWindowsForWorkspace(workspaceId: string): Window[];
  getWindow(winId: string): Window | undefined;
}
```

## Migration from Legacy Interface

**Before (interface-based):**
```typescript
const window: Window = {
  id: 'win-1',
  appId: 'my-app',
  title: 'Title',
  // ...
};
```

**After (class-based):**
```typescript
const window = new Window('my-app', 'Title', bounds);
window.setTitle('New Title', 'app');
```

## Best Practices

1. **Apps Create Windows**: Apps should create Window instances in `initialWindow()`
2. **Shared Control**: Use `'app'` source when modifying from app, `'os'` from OS
3. **Event-Driven**: Listen to window events for reactive updates
4. **State Management**: Use window payload for window-specific data
5. **Workspace Organization**: Use workspaces to organize windows
