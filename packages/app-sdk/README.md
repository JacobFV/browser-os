# @browser-os/app-sdk

Application SDK for browser-os - Object-oriented app architecture with process management and window lifecycle.

## Installation

```bash
pnpm add @browser-os/app-sdk
```

## Architecture Overview

Browser-OS uses an object-oriented architecture where:

- **Apps are Processes**: Each app is a class that extends `App` and manages its own process
- **Apps Own Windows**: Apps create and initialize their own `Window` instances
- **Shared Window Control**: Both the App and OS can modify window properties
- **Separation of Concerns**: App logic is separated from React UI components

## Core Concepts

### App Base Class

All applications extend the abstract `App` class:

```typescript
import { App } from '@browser-os/app-sdk';
import { Container } from '@browser-os/core';
import { Window } from '@browser-os/windowing';
import { EventBus } from '@browser-os/core';

class MyApp extends App {
  readonly id = 'my-app';
  readonly name = 'My Application';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
    // Dependencies are automatically resolved from container
    // Access via: this.processManager, this.eventBus, this.container
  }
  
  // Apps create their own windows
  initialWindow(config?: Record<string, unknown>): Window {
    const eventBus = this.container.resolve('eventBus') as EventBus;
    return new Window(
      this.id,
      'My Window',
      { x: 100, y: 100, w: 800, h: 600 },
      config?.workspaceId as string || 'default',
      config,
      eventBus
    );
  }
  
  // Apps create React components for their UI
  createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType {
    return () => <MyAppView window={window} />;
  }
  
  // Lifecycle hooks
  async onLaunch(window: Window, config?: Record<string, unknown>): Promise<void> {
    // Initialize app process
    this.initialize();
  }
  
  onClose(window: Window): void {
    // Cleanup
    this.cleanup();
  }
}
```

### Window Class

Windows are instances that can be controlled by both App and OS:

```typescript
import { Window } from '@browser-os/windowing';

// Create window
const window = new Window(
  'my-app',
  'Window Title',
  { x: 100, y: 100, w: 800, h: 600 }
);

// App can modify window
window.setTitle('New Title', 'app');
window.moveTo(200, 200, 'app');

// OS can also modify window
window.setTitle('OS Title', 'os');
window.maximize('os');
```

### Dependency Injection with Container

Apps receive dependencies through a type-safe Container:

```typescript
import { Container } from '@browser-os/core';
import { EventBus } from '@browser-os/core';
import type { ProcessManager, WindowManager } from '@browser-os/...';

const container = new Container();
container.register('eventBus', new EventBus());
container.register('processManager', processManager);
container.register('windowManager', windowManager);
// ... register other dependencies

// Apps receive the container in their constructor
const app = new MyApp(container);
```

### AppManager

Manages app instances and coordinates window creation:

```typescript
import { AppManager } from '@browser-os/app-sdk';
import type { WindowManager, ProcessManager } from '@browser-os/...';
import { EventBus } from '@browser-os/core';

const appManager = new AppManager(windowManager, processManager, eventBus);

// Register apps
const app = new MyApp(container);
appManager.registerApp(app);

// Launch app (creates window)
const window = appManager.launchApp('my-app', { config: 'value' });

// Close window
appManager.closeWindow(window.id);
```

### OS Class

Top-level orchestrator for the entire system:

```typescript
import { OS } from '@browser-os/app-sdk';
import { TerminalApp } from '@system-apps/terminal';
import { CalculatorApp } from '@system-apps/calculator';

// Create OS with container
const container = new Container();
// ... register dependencies
const os = new OS({ container });

// Register apps
os.registerApp(new TerminalApp(os.getContainer()));
os.registerApp(new CalculatorApp(os.getContainer()));

// Launch apps
os.launchApp('terminal');
os.launchApp('calculator');

// Get managers
const appManager = os.getAppManager();
const windowManager = os.getWindowManager();
```

## App Lifecycle

Apps have a clear lifecycle:

1. **Registration**: App instance is created and registered with AppManager
2. **Launch**: First window is created → `onLaunch()` called
3. **Window Created**: Each window creation → `onWindowCreated()` called
4. **Window Destroyed**: Window closed → `onWindowDestroyed()` called
5. **Close**: Last window closed → `onClose()` called

## Process Management

Apps automatically spawn processes:

```typescript
class MyApp extends App {
  async onLaunch(window: Window): Promise<void> {
    // Process is automatically spawned
    this.initialize(); // Calls processManager.spawnApp()
    
    // Access process ID
    const pid = this.getPid();
  }
  
  onClose(window: Window): void {
    // Process is automatically killed
    this.cleanup(); // Calls processManager.kill()
  }
}
```

## Multi-Window Apps

Apps can create multiple windows:

```typescript
class MyApp extends App {
  createWindow(config?: Record<string, unknown>): Window {
    // Create additional windows
    return this.initialWindow(config);
  }
  
  getWindows(): Window[] {
    // Get all windows for this app
    return super.getWindows();
  }
}
```

## Shared Window Control

Both App and OS can control windows:

```typescript
// From App
window.setTitle('App Title', 'app');
window.moveTo(100, 100, 'app');

// From OS/WindowManager
window.setTitle('OS Title', 'os');
window.maximize('os');
```

Changes are synchronized via the event bus.

## Examples

### Simple App

```typescript
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';

class SimpleApp extends App {
  readonly id = 'simple';
  readonly name = 'Simple App';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(): Window {
    const eventBus = this.container.resolve('eventBus') as EventBus;
    return new Window(this.id, 'Simple', { x: 100, y: 100, w: 400, h: 300 }, 'default', undefined, eventBus);
  }
  
  createComponent(window: Window): React.ComponentType {
    return () => <div>Hello from {window.title}</div>;
  }
}
```

### App with Process Logic

```typescript
class TerminalApp extends App {
  private shellProcess?: ShellProcess;
  
  async onLaunch(window: Window): Promise<void> {
    // Initialize process logic
    this.shellProcess = new ShellProcess(this.processManager, vfs);
    this.initialize();
  }
  
  createComponent(window: Window): React.ComponentType {
    return () => <TerminalView shell={this.shellProcess!} window={window} />;
  }
  
  onClose(window: Window): void {
    this.shellProcess?.cleanup();
    this.cleanup();
  }
}
```

## API Reference

### App Class

```typescript
abstract class App {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  
  abstract initialWindow(config?: Record<string, unknown>): Window;
  abstract createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType;
  
  onLaunch?(window: Window, config?: Record<string, unknown>): void | Promise<void>;
  onClose?(window: Window): void | Promise<void>;
  onWindowCreated?(window: Window): void;
  onWindowDestroyed?(window: Window): void;
  
  getWindows(): Window[];
  getWindow(windowId: string): Window | undefined;
  createWindow(config?: Record<string, unknown>): Window;
  getPid(): Pid | undefined;
  getState<T = unknown>(key: string): T | undefined;
  setState(key: string, value: unknown): void;
}
```

### AppManager Class

```typescript
class AppManager {
  registerApp(app: App): void;
  registerApps(apps: App[]): void;
  getApp(appId: string): App | undefined;
  getAllApps(): App[];
  launchApp(appId: string, config?: Record<string, unknown>): Window;
  closeWindow(windowId: string): void;
  closeApp(appId: string): void;
  suspendApp(appId: string): void;
  resumeApp(appId: string): void;
}
```

### OS Class

```typescript
class OS {
  constructor(config: OSConfig);
  getAppManager(): AppManager;
  getWindowManager(): WindowManager;
  getProcessManager(): ProcessManager;
  launchApp(appId: string, config?: Record<string, unknown>): Window;
  closeWindow(windowId: string): void;
  closeApp(appId: string): void;
  registerApp(app: App): void;
  registerApps(apps: App[]): void;
  shutdown(): void;
}
```

## Migration Guide

### From Legacy Component-Based Apps

**Before:**
```typescript
export const MyApp: React.FC = () => {
  // All logic in component
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

## Best Practices

1. **Separate Logic from UI**: Keep business logic in App class, UI in View components
2. **Use Process Management**: Leverage `initialize()` and `cleanup()` for process lifecycle
3. **Window Ownership**: Apps own their windows, but OS can also control them
4. **Lifecycle Hooks**: Use lifecycle hooks for initialization and cleanup
5. **State Management**: Use `getState()` and `setState()` for app-level state
