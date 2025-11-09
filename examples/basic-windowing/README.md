# Basic Windowing Example

Example demonstrating the object-oriented windowing system in browser-os.

## Usage

```bash
pnpm --filter @browser-os/example-basic-windowing dev
```

## Features Demonstrated

- Creating Window instances using the Window class
- Registering windows with WindowManager
- Controlling windows programmatically
- Handling window events
- Shared control between apps and OS

## Code Example

```typescript
import { Window, windowManager } from '@browser-os/windowing';

// Create a window
const window = new Window(
  'my-app',
  'My Window',
  { x: 100, y: 100, w: 500, h: 400 },
  'default',
  { content: 'Hello' }
);

// Register with window manager
windowManager.registerWindow(window);

// Control window
window.setTitle('New Title', 'app');
window.moveTo(200, 200, 'os');
window.maximize('os');
```
