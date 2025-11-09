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

### Manifest

Apps define their capabilities and entry point:

```typescript
{
  id: 'app-id',
  name: 'App Name',
  version: '1.0.0',
  entry: () => import('./App'),
  permissions: ['fs.read', 'fs.write'],
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

