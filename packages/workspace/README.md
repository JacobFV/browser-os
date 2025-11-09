# @browser-os/workspace

Workspace management for browser-os - multi-desktop support and layout persistence.

## Installation

```bash
pnpm add @browser-os/workspace
```

## Features

- **Multi-Workspace**: Create and switch between multiple workspaces
- **Layout Persistence**: Save and restore window layouts
- **Workspace Profiles**: Different themes and settings per workspace
- **Hot Switching**: Switch workspaces with keyboard shortcuts

## Usage

### Creating Workspaces

```typescript
import { workspaceManager } from '@browser-os/workspace';

// Create a new workspace
const workspace = workspaceManager.createWorkspace('Development', 'desktop');

// Create mobile workspace
const mobileWorkspace = workspaceManager.createWorkspace('Mobile', 'mobile');
```

### Switching Workspaces

```typescript
import { workspaceManager, loadWorkspace } from '@browser-os/workspace';

// Set current workspace
workspaceManager.setCurrentWorkspace('workspace-id');

// Or use helper function
await loadWorkspace('workspace-id');
```

### Saving Workspaces

```typescript
import { workspaceManager, saveWorkspace } from '@browser-os/workspace';

// Save current workspace
const current = workspaceManager.getCurrentWorkspace();
current.name = 'My Workspace';
workspaceManager.saveWorkspace(current);

// Or use helper function
await saveWorkspace('My Workspace');
```

### Loading Workspaces

```typescript
import { workspaceManager, loadWorkspace } from '@browser-os/workspace';

// Load workspace by ID
const workspace = workspaceManager.loadWorkspace('workspace-id');
if (workspace) {
  await loadWorkspace('workspace-id');
}

// Get all workspaces
const allWorkspaces = workspaceManager.getAllWorkspaces();
```

## Workspace Interface

```typescript
interface Workspace {
  id: string;
  name: string;
  layout: {
    dockview: unknown;      // Serialized dock layout
    windows: Window[];      // Floating windows
  };
  mode: 'desktop' | 'mobile';
  theme: {
    skin: 'win95' | 'macos' | 'monaco' | 'glass';
    accent?: string;
  };
}
```

## Workspace Modes

### Desktop Mode

- XY window positioning
- Taskbar at bottom/top
- Floating windows
- Desktop icons

### Mobile Mode

- Full-screen app cards
- App switcher replaces taskbar
- Home screen grid
- Gesture navigation

## Layout Persistence

Workspaces save:
- Window positions and sizes
- Dock layouts (if using dockview)
- Window states (minimized, maximized, etc.)
- Z-order

## Keyboard Shortcuts

- **Ctrl+Win+Left**: Switch to previous workspace
- **Ctrl+Win+Right**: Switch to next workspace
- **Ctrl+Win+N**: Create new workspace

## Integration with Windowing

```typescript
import { windowManager } from '@browser-os/windowing';
import { workspaceManager } from '@browser-os/workspace';

// Get windows for current workspace
const currentWorkspace = workspaceManager.getCurrentWorkspace();
const windows = windowManager.getWindowsForWorkspace(currentWorkspace.id);

// Save window layout
currentWorkspace.layout.windows = Array.from(windowManager.windows.values());
workspaceManager.saveWorkspace(currentWorkspace);
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

