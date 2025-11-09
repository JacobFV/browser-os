# Browser-OS Getting Started Guide

## Quick Start

### 1. Create App Instances

```typescript
import { TerminalApp } from '@system-apps/terminal';
import { CalculatorApp } from '@system-apps/calculator';
import { processManager } from '@browser-os/process';
import { vfs } from '@browser-os/fs';

const terminalApp = new TerminalApp(processManager, vfs);
const calculatorApp = new CalculatorApp(processManager);
```

### 2. Initialize OS

```typescript
import { initDesktopShell } from '@browser-os/shell';

const state = await initDesktopShell({
  apps: {
    appInstances: [terminalApp, calculatorApp],
  },
});
```

### 3. Launch Apps

```typescript
// Via OS
state.os?.launchApp('terminal');
state.os?.launchApp('calculator');

// Or via AppManager
state.appManager?.launchApp('terminal');
```

## Creating Your Own App

### Step 1: Create App Class

```typescript
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';

class MyApp extends App {
  readonly id = 'my-app';
  readonly name = 'My Application';
  readonly version = '1.0.0';
  
  constructor(processManager: ProcessManager) {
    super(processManager);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'My Window',
      { x: 100, y: 100, w: 800, h: 600 },
      config?.workspaceId || 'default',
      config
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <MyAppView window={window} />;
  }
  
  async onLaunch(window: Window, config?: Record<string, any>): Promise<void> {
    // Initialize your app
    this.initialize(); // Spawns process
  }
  
  onClose(window: Window): void {
    // Cleanup
    this.cleanup(); // Kills process
  }
}
```

### Step 2: Create View Component

```typescript
import { Window } from '@browser-os/windowing';

interface MyAppViewProps {
  window: Window;
}

export const MyAppView: React.FC<MyAppViewProps> = ({ window }) => {
  // Update window title from app
  useEffect(() => {
    window.setTitle('Updated Title', 'app');
  }, [window]);
  
  return (
    <div>
      <h1>{window.title}</h1>
      <p>Window ID: {window.id}</p>
    </div>
  );
};
```

### Step 3: Register App

```typescript
import { initDesktopShell } from '@browser-os/shell';

const myApp = new MyApp(processManager);

const state = await initDesktopShell({
  apps: {
    appInstances: [myApp],
  },
});
```

## Window Control

### From App

```typescript
class MyApp extends App {
  createComponent(window: Window): React.ComponentType {
    return () => {
      // App can control its own windows
      const handleClick = () => {
        window.setTitle('Clicked!', 'app');
        window.moveTo(200, 200, 'app');
      };
      
      return <button onClick={handleClick}>Move Window</button>;
    };
  }
}
```

### From OS

```typescript
// OS can also control windows
const window = windowManager.getWindow(windowId);
if (window) {
  window.maximize('os');
  window.setTitle('OS Title', 'os');
}
```

## Process Management

Apps automatically manage processes:

```typescript
class MyApp extends App {
  async onLaunch(window: Window): Promise<void> {
    // Process is automatically spawned
    this.initialize();
    
    // Access process ID
    const pid = this.getPid();
    const proc = this.processManager.getProcess(pid);
    
    // Set process properties
    if (proc) {
      proc.env = { MY_VAR: 'value' };
      proc.cwd = 'vfs://documents/';
    }
  }
  
  onClose(window: Window): void {
    // Process is automatically killed
    this.cleanup();
  }
}
```

## Multi-Window Apps

Apps can create multiple windows:

```typescript
class MyApp extends App {
  createNewWindow(): void {
    const newWindow = this.createWindow({ type: 'secondary' });
    windowManager.registerWindow(newWindow);
    this.registerWindow(newWindow);
  }
  
  getWindows(): Window[] {
    return super.getWindows(); // Returns all windows for this app
  }
}
```

## Event Handling

Listen to window events:

```typescript
import { eventBus } from '@browser-os/core';

eventBus.on('window', (event) => {
  if (event.type === 'open') {
    console.log('Window opened:', event.winId);
  } else if (event.type === 'close') {
    console.log('Window closed:', event.winId);
  } else if (event.type === 'move') {
    console.log('Window moved:', event.winId, event.x, event.y);
  }
});
```

## Best Practices

1. **Always extend App**: Don't create React components directly
2. **Separate Logic from UI**: Keep business logic in App class
3. **Use Lifecycle Hooks**: Initialize in `onLaunch()`, cleanup in `onClose()`
4. **Window Ownership**: Apps own their windows, create them in `initialWindow()`
5. **Shared Control**: Use appropriate source ('app' or 'os') when modifying windows
6. **Process Management**: Use `initialize()` and `cleanup()` for process lifecycle
7. **Event-Driven**: Listen to events for reactive updates

## Examples

- **Basic Windowing**: `examples/basic-windowing` - Window class usage
- **Terminal App**: `system-apps/terminal` - Full app with process logic
- **Calculator App**: `system-apps/calculator` - Simple app example

