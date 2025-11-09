# Browser OS - Architecture Documentation

## Overview

browser-os is a complete operating system that runs in the browser. It provides desktop and mobile shells, window management, a virtual filesystem, process management, and an app ecosystem.

## Core Architecture

### Desktop Shell Composition

The desktop shell is composed of:

```
Shell = Windowing + Desktop + Taskbar + Workspaces + App Host + Process Manager + FS + Cursor + Theme
```

### Mode Switching

The system supports two modes:

- **Desktop Mode**: XY window positioning, taskbar at bottom/top, floating windows
- **Mobile Mode**: Full-screen cards, app switcher replaces taskbar, desktop grid = home screen

## Package Structure

### Core Packages

- **@browser-os/core**: Event bus, ID generation, Zod contracts
- **@browser-os/ui**: Primitive React components
- **@browser-os/theme**: Theme tokens and skin presets

### Windowing System

- **@browser-os/windowing**: Window management, z-order, snap system
- **@browser-os/workspace**: Multi-desktop, save/restore layouts
- **@browser-os/taskbar**: Taskbar and app switcher components
- **@browser-os/desktop**: Wallpaper, desktop icons, context menus

### System Services

- **@browser-os/process**: Process lifecycle, scheduler, IPC
- **@browser-os/fs**: Virtual filesystem with multiple drivers
- **@browser-os/shell**: Desktop/mobile shell composition

### App System

- **@browser-os/app-sdk**: App manifest, capabilities, lifecycle API
- **@browser-os/app-host**: Sandboxing, capability guards

### Additional Services

- **@browser-os/cursor**: Cursor presence, optional Yjs integration
- **@browser-os/net**: Network abstraction (fetch, WS, SSE, RTC)
- **@browser-os/notif**: Notifications and toasts
- **@browser-os/settings**: User/workspace/system preferences
- **@browser-os/telemetry**: Performance metrics and logging
- **@browser-os/dialogs**: System file dialogs (open/save)

## Data Flow

### Event Bus

All system events flow through a typed event bus:

```typescript
eventBus.on('window', (event) => { /* ... */ });
eventBus.on('proc', (event) => { /* ... */ });
eventBus.on('fs', (event) => { /* ... */ });
```

### State Management

- **Zustand**: For reactive state stores
- **TanStack Query**: For async resource management
- **XState**: For process lifecycles

## Window Management

### Window States

- `floating`: Normal window that can be moved/resized
- `docked`: Window docked to editor layout
- `minimized`: Window minimized to taskbar
- `maximized`: Window fills screen
- `fullscreen`: Window in fullscreen mode

### Z-Order

Windows are automatically ordered by focus. The most recently focused window has the highest z-index.

### Snap System

Windows snap to:
- Grid positions (8px default)
- Screen edges
- Neighboring windows

### Window Arrangement

Windows can be arranged in preset patterns:
- **grid-2x2**: Arrange windows in a 2x2 grid layout
- **stack-right**: Main window on left (70%), remaining windows stacked on right (30%)
- **monocle**: All windows maximized, stacked by z-order

## Process Management

### Lifecycle

```
starting → running → (suspended | stopped | crashed)
```

- **starting**: Process initialization
- **running**: Active execution
- **suspended**: Paused (minimized/inactive)
- **stopped**: Normal termination
- **crashed**: Error termination

### IPC

Topic-based pub/sub system:

```typescript
send(pid, 'topic', message);
process.channels['topic'] = (msg) => { /* ... */ };
```

## Virtual Filesystem

### URI Scheme

All files use `vfs://` URIs:

```
vfs://<mount-point>/<path>
```

### Drivers

- **mem**: In-memory filesystem
- **idb**: IndexedDB persistent storage
- **opfs**: Origin Private File System
- **localStorage**: Fallback storage

### Mount System

Drivers are mounted at mount points:

```typescript
vfs.mount({
  mountPoint: '/home',
  driver: idbDriver(),
});
```

## App System

### App Registry

The `AppRegistry` class manages app manifests and dynamic loading:

```typescript
const registry = new AppRegistry();
registry.register(manifest);
registry.registerMany([manifest1, manifest2]);
const app = await registry.loadApp('app-id');
```

### Manifest

Apps define their capabilities and entry point:

```typescript
{
  id: 'app-id',
  name: 'App Name',
  version: '1.0.0',
  entry: string | (() => Promise<React.ComponentType>),
  permissions: ['fs.read', 'fs.write'],
  defaultWindow?: { w: number; h: number; resizable?: boolean },
  intents?: string[],
}
```

### Sandboxing

Untrusted apps run in iframes with:
- Restricted postMessage IPC
- CSP enforcement
- Capability guards

### Capabilities

Apps request permissions:
- `fs.read`, `fs.write`
- `net.fetch`, `net.ws`
- `clipboard`, `notifications`
- `camera`, `mic`, `rtc`
- `proc.spawn`, `proc.ipc`

## Theme System

### Tokens

CSS variables define theme tokens:

```css
--os-bg: #c0c0c0;
--os-fg: #000000;
--os-accent: #000080;
--os-radius: 0px;
```

### Skins

- **win95**: Pixel borders, titlebar gradients
- **macos**: Translucent, rounded, traffic lights
- **monaco**: Editor-serious, VS Code tabs
- **glass**: Glassmorphism effects

## Mobile Mode

### Adaptations

- Windows become full-screen cards
- Taskbar → App switcher grid
- Desktop icons → Home screen pages
- Gesture support (swipe up, left/right)

## Security Model

### Capabilities

Apps request permissions; system shows consent sheet.

### Sandboxing

Untrusted apps run in iframes with:
- Restricted IPC
- CSP enforcement
- Rate limiting

### Crash Isolation

App errors bubble to process manager with restart option.

## Performance

### Targets

- Drag operations: 60fps
- Window open: < 200ms
- Shell TTI: < 2s

### Optimization

- React.memo for expensive components
- Virtual scrolling for long lists
- Lazy loading for app components
- rAF-based rendering budget

## Accessibility

- Tab order for keyboard navigation
- Focus rings on interactive elements
- Reduced motion support
- Screen reader labels
- Semantic HTML

## Applications

### Web Shell (`apps/web-shell`)

Main OS interface running in the browser:
- Desktop/mobile shell composition
- App rendering and lifecycle
- Command palette
- Global shortcuts
- Mobile gesture support

### Electron Shell (`apps/electron-shell`)

Electron wrapper for desktop deployment:
- Native window management
- System integration
- Auto-updater support

### Showcase (`apps/showcase`)

Component gallery demonstrating:
- UI components
- Theme variations
- Window management features

## System Apps

Built-in applications included with browser-os:

- **Files**: File manager with mount point navigation, file operations, drag & drop
- **Terminal**: xterm.js terminal emulator with shell command execution
- **Editor**: Monaco-based code editor
- **Browser**: Web browser with tab management and iframe sandboxing
- **Notes**: Note-taking application
- **Calendar**: Calendar application
- **Settings**: System settings panel
- **Store**: App store for installing/updating apps
- **Monitor**: Process monitor and system metrics
- **Calculator**: Calculator application
- **Word Processor**: Document editor with formatting

## Examples

Example applications demonstrating browser-os features:

- **basic-windowing**: Window management basics
- **theme-switching**: Theme system usage
- **custom-app**: Building custom apps
- **win95**: Win95 theme showcase

## Testing

### E2E Tests

Playwright tests for:
- Windowing operations
- Mobile switcher
- App installation
- Process management

### Property Tests

Serialization round-trip tests for:
- Window layouts
- Workspace configurations
- App manifests

