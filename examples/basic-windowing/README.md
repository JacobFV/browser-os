# Basic Windowing Example

Example demonstrating the new object-oriented windowing system in browser-os.

## Overview

This example shows how to:
- Create Window instances using the Window class
- Register windows with WindowManager
- Control windows programmatically
- Handle window events
- Use shared control between apps and OS

## Architecture

This example demonstrates the new architecture where:
- Windows are instances of the `Window` class
- Windows can be controlled by both apps and the OS
- Changes are synchronized via the event bus

## Usage

```bash
# Run example
pnpm --filter @browser-os/example-basic-windowing dev
```

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

## Features Demonstrated

- Creating Window instances
- Registering windows with WindowManager
- Window focus management
- Window state changes (minimize, maximize, restore)
- Window movement and resizing
- Event-driven updates
- Shared control (app vs OS)
