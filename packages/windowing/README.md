# @browser-os/windowing

Window management system for browser-os with floating windows, snap-to-grid, and multi-workspace support.

## Installation

```bash
pnpm add @browser-os/windowing
```

## Features

- **Window Management**: Create, close, focus, move, and resize windows
- **Window States**: Floating, docked, minimized, maximized, fullscreen
- **Z-Order Management**: Automatic focus-based z-ordering
- **Window Arrangement**: Grid, stack, and monocle layouts
- **Workspace Support**: Multi-desktop window organization

## Usage

### Basic Window Operations

```typescript
import { openWindow, closeWindow, focusWindow, windowManager } from '@browser-os/windowing';

// Open a window
const window = openWindow({
  appId: 'my-app',
  title: 'My Application',
  bounds: { x: 100, y: 100, w: 800, h: 600 },
  workspaceId: 'workspace-1',
});

// Focus a window
focusWindow(window.id);

// Close a window
closeWindow(window.id);

// Get all windows
const windows = Array.from(windowManager.windows.values());
```

### Window Arrangement

```typescript
import { arrangeWindows } from '@browser-os/windowing';

// Arrange windows in a 2x2 grid
arrangeWindows('grid-2x2');

// Stack windows (main + sidebar)
arrangeWindows('stack-right');

// Monocle (all windows fullscreen)
arrangeWindows('monocle');
```

### Window States

```typescript
import { windowManager } from '@browser-os/windowing';

// Set window state
windowManager.setWindowState('win-123', 'maximized');
windowManager.setWindowState('win-123', 'minimized');
windowManager.setWindowState('win-123', 'floating');
```

### Workspace Windows

```typescript
import { windowManager } from '@browser-os/windowing';

// Get windows for a workspace
const workspaceWindows = windowManager.getWindowsForWorkspace('workspace-1');
```

## Window Interface

```typescript
interface Window {
  id: string;
  appId: string;
  title: string;
  state: 'floating' | 'docked' | 'minimized' | 'maximized' | 'fullscreen';
  z: number;
  bounds: { x: number; y: number; w: number; h: number };
  workspaceId: string;
  payload?: Record<string, any>;
}
```

## Events

The windowing system emits events via `@browser-os/core` event bus:

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
    // ... other event types
  }
});
```

## Keyboard Shortcuts

- **Alt+Tab**: Cycle through windows
- **Arrow Keys**: Nudge window position (1px)
- **Shift+Arrow Keys**: Nudge window position (10px)
- **Alt**: Disable snap while dragging

## Snap System

Windows automatically snap to:
- Grid positions (8px grid by default)
- Screen edges
- Neighboring windows

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

