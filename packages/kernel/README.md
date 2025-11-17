# @browser-os/kernel

Kernel with syscall routing, permissions, and security.

## Overview

The kernel orchestrates all system modules, routes syscalls to appropriate handlers, and enforces security permissions. It initializes the filesystem, process manager, and app registry.

## Usage

### Basic Usage

```typescript
import { Kernel } from '@browser-os/kernel';

// Create kernel
const kernel = new Kernel();

// Initialize (sets up filesystem, loads config, registers syscalls)
await kernel.init();
```

### Using createKernel Helper

For convenience, use the `createKernel` helper to automatically set up all managers:

```typescript
import { createKernel } from '@browser-os/kernel';

// Create kernel with all managers (defaults)
const kernel = createKernel();
await kernel.init();

// Or provide custom managers
const kernel = createKernel({
  windowManager: customWindowManager,
  createDefaults: true // Creates defaults for managers not provided
});
await kernel.init();

// Handle syscall
const response = await kernel.handleSyscall({
  id: crypto.randomUUID(),
  syscall: 'fs.read',
  args: { path: '/home/user/file.txt' },
  pid: 123,
});

// Get module instances
const fs = kernel.getFS();
const procManager = kernel.getProcessManager();
const appRegistry = kernel.getAppRegistry();
const eventBus = kernel.getEventBus();

// Set permissions for a process
kernel.setPermissions(pid, {
  allowedSyscalls: ['fs.read', 'fs.write'],
  fsAccess: ['/home/user/**', '/tmp/**'],
});

// Get security context
const context = kernel.getSecurityContext(pid);
```

## Initialization Sequence

1. Initialize filesystem with default mounts
2. Create default directory structure
3. Load system configuration from `/etc/config.json`
4. Load app registry from `/etc/registry.json`
5. Register syscall handlers (fs, proc, registry, window, clipboard, power, audio, media, location, sensor, print, etc.)
6. Set up default permissions
7. Emit `kernel:ready` event

## Syscalls

### Filesystem
- `fs.read(path)` - Read file
- `fs.write(path, data)` - Write file
- `fs.delete(path)` - Delete file
- `fs.mkdir(path)` - Create directory
- `fs.rmdir(path)` - Remove directory
- `fs.readdir(path)` - List directory
- `fs.stat(path)` - Get file metadata
- `fs.exists(path)` - Check if path exists

### Process
- `proc.spawn(appId, args, options)` - Spawn process
- `proc.kill(pid, signal)` - Kill process
- `proc.list()` - List all processes
- `proc.get(pid)` - Get process info

### Registry
- `registry.list(enabled?)` - List apps
- `registry.get(appId)` - Get app info
- `registry.isInstalled(appId)` - Check if installed

### Window
- `window.create(options)` - Create a new window
- `window.get(windowId)` - Get window information
- `window.update(windowId, updates)` - Update window properties (position, size, etc.)
- `window.close(windowId)` - Close a window
- `window.minimize(windowId)` - Minimize a window
- `window.maximize(windowId)` - Maximize a window
- `window.restore(windowId)` - Restore a minimized/maximized window
- `window.focus(windowId)` - Focus a window

### Clipboard
- `clipboard.readText()` - Read text from clipboard
- `clipboard.writeText(text)` - Write text to clipboard
- `clipboard.read()` - Read clipboard data (any type)
- `clipboard.write(data)` - Write clipboard data (any type)
- `clipboard.clear()` - Clear clipboard
- `clipboard.hasText()` - Check if clipboard has text
- `clipboard.hasImage()` - Check if clipboard has image

### Power
- `power.requestWakeLock(type)` - Request wake lock to prevent screen sleep
- `power.releaseWakeLock()` - Release wake lock
- `power.isWakeLockActive()` - Check if wake lock is active
- `power.getBatteryStatus()` - Get battery status
- `power.isOnBattery()` - Check if device is on battery power
- `power.getBatteryLevel()` - Get battery level (0-1)

### Audio
- `audio.play(url, options)` - Play audio from URL
- `audio.stop(audioId)` - Stop audio playback
- `audio.pause(audioId)` - Pause audio playback
- `audio.resume(audioId)` - Resume audio playback
- `audio.setVolume(audioId, volume)` - Set volume (0-1)
- `audio.getVolume(audioId)` - Get volume (0-1)
- `audio.beep(frequency?, duration?)` - Play beep sound

### Media
- `media.getUserMedia(constraints)` - Request camera/microphone access
- `media.stopStream(streamId)` - Stop a media stream
- `media.stopAllStreams()` - Stop all media streams
- `media.enumerateDevices()` - Enumerate available media devices

### Location
- `location.getCurrentPosition(options?)` - Get current geolocation position

### Sensor
- `sensor.isSupported()` - Check if sensors are supported
- `sensor.startAccelerometer(options?)` - Start accelerometer
- `sensor.stopAccelerometer()` - Stop accelerometer
- `sensor.startGyroscope(options?)` - Start gyroscope
- `sensor.stopGyroscope()` - Stop gyroscope
- `sensor.startMagnetometer(options?)` - Start magnetometer
- `sensor.stopMagnetometer()` - Stop magnetometer
- `sensor.stopAll()` - Stop all sensors

### Print
- `print.html(html, options?)` - Print HTML content
- `print.window(options?)` - Print current window
- `print.url(url, options?)` - Print URL content

## Security

- Default deny: processes must have explicit permissions
- Permission checks before every syscall
- Filesystem access restricted to allowed paths
- Process isolation via security contexts

