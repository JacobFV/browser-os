# Browser-OS Architecture Documentation

## Overview

Browser-OS is a complete operating system that runs in the browser, built with an object-oriented architecture where apps are processes that own and control their windows.

## Core Architecture Principles

### 1. Apps as Processes

Every application in browser-os is a class that extends `App`:

```typescript
class MyApp extends App {
  readonly id = 'my-app';
  readonly name = 'My Application';
  readonly version = '1.0.0';
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(this.id, 'My Window', bounds);
  }
  
  createComponent(window: Window): React.ComponentType {
    return () => <MyAppView window={window} />;
  }
}
```

### 2. Apps Own Windows

Apps create and initialize their own `Window` instances:

- Apps define window configuration in `initialWindow()`
- Apps can create multiple windows via `createWindow()`
- Apps track their windows via `getWindows()`

### 3. Shared Window Control

Both Apps and the OS can modify window properties:

```typescript
// From App
window.setTitle('App Title', 'app');
window.moveTo(100, 100, 'app');

// From OS
window.setTitle('OS Title', 'os');
window.maximize('os');
```

Changes are synchronized via the event bus.

### 4. Separation of Concerns

- **App Class**: Business logic, process management, state
- **View Component**: Pure UI rendering (React component)
- **Window Class**: Window state and properties
- **WindowManager**: OS-level window management

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           OS Class                       │
│  - Orchestrates all subsystems          │
│  - Provides unified API                  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐   ┌──────▼──────────┐
│ AppManager    │   │ WindowManager   │
│ - App registry│   │ - Window state  │
│ - Lifecycle   │   │ - Z-ordering    │
└───┬───────────┘   └──────┬──────────┘
    │                     │
    │              ┌──────▼──────────┐
    │              │ ProcessManager  │
    │              │ - Process state │
    │              │ - IPC           │
    │              └─────────────────┘
    │
┌───▼──────────┐
│ App Classes  │
│ - TerminalApp│
│ - Calculator │
│ - ...        │
└──────────────┘
```

## Component Structure

### App Class

```typescript
abstract class App {
  // Identity
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  
  // Window creation
  abstract initialWindow(config?: Record<string, any>): Window;
  abstract createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any>;
  
  // Lifecycle
  onLaunch?(window: Window, config?: Record<string, any>): void | Promise<void>;
  onClose?(window: Window): void | Promise<void>;
  onWindowCreated?(window: Window): void;
  onWindowDestroyed?(window: Window): void;
  
  // Process management
  protected initialize(): void;
  protected cleanup(): void;
  getPid(): Pid | undefined;
}
```

### Window Class

```typescript
class Window {
  readonly id: string;
  readonly appId: string;
  
  // Properties (read-only via getters)
  get title(): string;
  get state(): WindowState;
  get bounds(): WindowBounds;
  get workspaceId(): string;
  get z(): number;
  get payload(): Record<string, any> | undefined;
  
  // Mutators (with source tracking)
  setTitle(title: string, source: 'app' | 'os'): void;
  setState(state: WindowState, source: 'app' | 'os'): void;
  setBounds(bounds: Partial<WindowBounds>, source: 'app' | 'os'): void;
  minimize(source: 'app' | 'os'): void;
  maximize(source: 'app' | 'os'): void;
  restore(source: 'app' | 'os'): void;
  moveTo(x: number, y: number, source: 'app' | 'os'): void;
  resizeTo(w: number, h: number, source: 'app' | 'os'): void;
}
```

### AppManager

```typescript
class AppManager {
  registerApp(app: App): void;
  registerApps(apps: App[]): void;
  getApp(appId: string): App | undefined;
  launchApp(appId: string, config?: Record<string, any>): Window;
  closeWindow(windowId: string): void;
  closeApp(appId: string): void;
}
```

## Data Flow

### App Launch Flow

```
1. User clicks icon → OS.launchApp('terminal')
2. AppManager.getApp('terminal') → TerminalApp instance
3. TerminalApp.initialWindow() → Window instance
4. WindowManager.registerWindow(window) → Window registered
5. TerminalApp.registerWindow(window) → App tracks window
6. TerminalApp.onLaunch(window) → Process spawned
7. TerminalApp.createComponent(window) → React component
8. AppRenderer renders component → UI displayed
```

### Window Modification Flow

```
1. User drags window → WindowView calls onMove
2. WindowView calls window.moveTo(x, y, 'os')
3. Window updates internal state
4. Window emits 'window' event via eventBus
5. WindowManager and App both receive event
6. UI re-renders based on new state
```

## Process Management

Every app spawns a process:

```typescript
class MyApp extends App {
  async onLaunch(window: Window): Promise<void> {
    // Process automatically spawned
    this.initialize(); // Calls processManager.spawnApp(this.id)
    
    // Access process
    const pid = this.getPid();
    const proc = this.processManager.getProcess(pid);
  }
  
  onClose(window: Window): void {
    // Process automatically killed
    this.cleanup(); // Calls processManager.kill(this.pid)
  }
}
```

## Event System

All system events flow through the event bus:

```typescript
import { eventBus } from '@browser-os/core';

// Window events
eventBus.on('window', (event) => {
  // event.type: 'open' | 'close' | 'focus' | 'move' | 'resize' | ...
});

// Process events
eventBus.on('proc', (event) => {
  // event.type: 'spawn' | 'kill' | 'suspend' | 'resume' | 'crash'
});

// Filesystem events
eventBus.on('fs', (event) => {
  // event.type: 'mount' | 'unmount' | 'write' | 'delete' | 'rename'
});
```

## Package Structure

### Core Packages

- **@browser-os/core**: Event bus, ID generation, schemas
- **@browser-os/process**: Process management, IPC, command execution
- **@browser-os/windowing**: Window class, WindowManager, WindowView
- **@browser-os/app-sdk**: App base class, AppManager, OS class
- **@browser-os/fs**: Virtual filesystem
- **@browser-os/shell**: Shell initialization and state

### System Apps

- **@system-apps/terminal**: TerminalApp class with ShellProcess
- **@system-apps/calculator**: CalculatorApp class

## Best Practices

1. **Apps Own Windows**: Always create windows in `initialWindow()`
2. **Separate Logic from UI**: Keep business logic in App class, UI in View components
3. **Use Lifecycle Hooks**: Initialize resources in `onLaunch()`, cleanup in `onClose()`
4. **Process Management**: Use `initialize()` and `cleanup()` for process lifecycle
5. **Shared Control**: Use appropriate source ('app' or 'os') when modifying windows
6. **Event-Driven**: Listen to events for reactive updates, don't poll
7. **Type Safety**: Use TypeScript types throughout

## Migration Guide

### From Component-Based to Class-Based

**Before:**
```typescript
export const MyApp: React.FC = () => {
  // All logic in component
  const [state, setState] = useState();
  return <div>...</div>;
};
```

**After:**
```typescript
class MyApp extends App {
  // Logic in class
  createComponent(window: Window): React.ComponentType {
    return () => <MyAppView window={window} />;
  }
}
```

## Examples

See:
- `examples/basic-windowing`: Window class usage
- `system-apps/terminal`: Full app implementation with process logic
- `system-apps/calculator`: Simple app implementation
