# Getting Started Guide

Welcome to Browser OS! This guide will help you get started building applications for Browser OS.

## What is Browser OS?

Browser OS is a complete operating system that runs entirely in your web browser. It provides:

- **Window Management**: Create and manage application windows
- **Virtual Filesystem**: Unix-like filesystem with multiple storage backends
- **Process Management**: Run applications as isolated processes
- **Rich APIs**: Access to clipboard, audio, media, location, sensors, and more
- **Security**: Sandboxed execution with permission-based access control

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build the System

```bash
pnpm build
```

### 3. Start the Desktop Shell

```bash
pnpm --filter @browser-os/desktop-shell dev
```

Open your browser to `http://localhost:5173` (or the port shown in terminal).

## Your First App

Let's create a simple "Hello World" app that demonstrates the Browser OS APIs.

### Step 1: Create App File

Create `/bin/hello-world.js` in the filesystem (you can do this through the file browser app):

```javascript
// Hello World App for Browser OS
export default async function main(os) {
  // Create a window
  const window = await os.window.create({
    title: 'Hello World',
    width: 400,
    height: 300,
    workspaceId: 'workspace-1'
  });

  // Create a simple UI
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'system-ui, sans-serif';
  
  const title = document.createElement('h1');
  title.textContent = 'Hello, Browser OS!';
  title.style.margin = '0 0 20px 0';
  
  const button = document.createElement('button');
  button.textContent = 'Click Me!';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  
  button.onclick = async () => {
    // Show a notification
    await os.notification.show({
      title: 'Hello!',
      body: 'You clicked the button!',
      icon: '🎉'
    });
    
    // Play a beep sound
    await os.audio.beep(440, 200);
    
    // Update button text
    button.textContent = 'Clicked!';
  };
  
  container.appendChild(title);
  container.appendChild(button);
  
  // Get the window's content element and append our UI
  // Note: In a real app, you'd use React or another framework
  // This is simplified for demonstration
  const windowElement = document.querySelector(`[data-window-id="${window.id}"]`);
  if (windowElement) {
    const content = windowElement.querySelector('.window-content');
    if (content) {
      content.appendChild(container);
    }
  }
}
```

### Step 2: Register the App

The app needs to be registered in the app registry. This is typically done through the system configuration, but for development you can use the terminal app to write to `/etc/registry.json`.

### Step 3: Launch the App

Once registered, you can launch the app from:
- The taskbar (if `showInTaskbar: true` is set)
- The terminal: `spawn hello-world`
- Programmatically: `await os.syscall('proc.spawn', { appId: 'hello-world', args: [], options: {} })`

## Understanding the OS API

Every app receives an `os` object that provides access to system resources:

```typescript
interface OSAPI {
  pid: number;              // Process ID
  cwd: string;              // Current working directory
  env: Record<string, string>; // Environment variables
  syscall(name, args): Promise<unknown>; // Direct syscall access
  channel: Channel;         // IPC channel
  
  // APIs
  window: WindowAPI;
  notification: NotificationAPI;
  dialog: DialogAPI;
  clipboard: ClipboardAPI;
  storage: StorageAPI;
  process: ProcessAPI;
  network: NetworkAPI;
  system: SystemInfoAPI;
  power: PowerAPI;
  audio: AudioAPI;
  media: MediaAPI;
  location: LocationAPI;
  sensor: SensorAPI;
  print: PrintAPI;
}
```

## Common Patterns

### Creating a Window

```javascript
const window = await os.window.create({
  title: 'My App',
  width: 800,
  height: 600,
  workspaceId: 'workspace-1',
  resizable: true,
  minimizable: true,
  maximizable: true
});

// Update window properties
window.width = 1000;
window.height = 800;
window.x = 100;
window.y = 100;

// Window actions
await window.focus();
await window.maximize();
await window.minimize();
await window.restore();
await window.close();
```

### Reading/Writing Files

```javascript
// Read a file
const content = await os.syscall('fs.read', { path: '/home/user/document.txt' });

// Write a file
await os.syscall('fs.write', { 
  path: '/home/user/document.txt',
  data: 'Hello, World!'
});

// List directory
const files = await os.syscall('fs.readdir', { path: '/home/user' });
```

### Using Clipboard

```javascript
// Copy text
await os.clipboard.writeText('Hello, World!');

// Read text
const text = await os.clipboard.readText();

// Copy image
await os.clipboard.write({
  type: 'image',
  data: imageBytes,
  mimeType: 'image/png'
});
```

### Playing Audio

```javascript
// Play audio file
const audioId = await os.audio.play('https://example.com/sound.mp3', {
  volume: 0.8,
  loop: false
});

// Control playback
await os.audio.pause(audioId);
await os.audio.resume(audioId);
await os.audio.setVolume(audioId, 0.5);
await os.audio.stop(audioId);

// System beep
await os.audio.beep(440, 200);
```

### Accessing Camera/Microphone

```javascript
// Request media access
const { streamId, tracks } = await os.media.getUserMedia({
  video: true,
  audio: true
});

// Use the stream (attach to video element, etc.)
// ...

// Stop when done
await os.media.stopStream(streamId);
```

### Getting Location

```javascript
// Get current position
const position = await os.location.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000
});

console.log(`Latitude: ${position.latitude}`);
console.log(`Longitude: ${position.longitude}`);
```

### Using Sensors

```javascript
// Check if sensors are supported
if (await os.sensor.isSupported()) {
  // Start accelerometer
  await os.sensor.startAccelerometer({ frequency: 60 });
  
  // Listen for readings via events
  os.channel.on('sensor:accelerometer', (reading) => {
    console.log('Acceleration:', reading.x, reading.y, reading.z);
  });
  
  // Stop when done
  await os.sensor.stopAccelerometer();
}
```

## Next Steps

- Read the [API Usage Guide](./API_USAGE.md) for detailed examples
- Check out the [App Development Guide](./APP_DEVELOPMENT.md) for building production apps
- Review [Best Practices](./BEST_PRACTICES.md) for recommended patterns
- Explore the [Architecture Guide](./ARCHITECTURE.md) to understand the system

## Examples

Check out the system apps for real-world examples:

- **Terminal** (`system-apps/terminal`) - Command-line interface
- **Browser** (`system-apps/browser`) - Web browser
- **Notepad** (`system-apps/notepad`) - Text editor
- **File Browser** (`system-apps/file-browser`) - File manager

## Getting Help

- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues
- Review package READMEs for API documentation
- Look at existing system apps for code examples

Happy coding! 🚀

