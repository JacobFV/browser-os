# @browser-os/proc

Process lifecycle management.

## Overview

Manages process spawning, execution, communication, and termination. Processes run app code in a sandboxed environment with controlled access to system resources.

## Usage

```typescript
import { ProcessManager } from '@browser-os/proc';
import { EventBus } from '@browser-os/events';
import { FileSystem } from '@browser-os/fs';

const eventBus = new EventBus();
const fs = new FileSystem();
const procManager = new ProcessManager({
  eventBus,
  fs,
  syscallHandler: async (pid, syscall, args) => {
    // Handle syscalls
    return result;
  },
});

// Spawn a process
const process = await procManager.spawn('my-app', ['arg1', 'arg2'], {
  cwd: '/home/user',
  env: { NODE_ENV: 'production' },
});

// Get process info
const proc = procManager.get(process.pid);
const allProcs = procManager.list();

// Kill a process
await procManager.kill(process.pid, 'SIGTERM');

// Get IPC channel
const channel = procManager.getChannel(process.pid);
```

## Process Execution

Apps are JavaScript code stored in `/bin/<app-id>.js`. When spawned:

1. App code is loaded from filesystem
2. Process instance is created with PID
3. IPC channel is created
4. Code is executed in sandboxed environment with `os` API
5. Process runs until termination

## Sandboxed API

Apps receive an `os` object with a comprehensive API for interacting with the system:

```typescript
interface OSAPI {
  pid: number;
  cwd: string;
  env: Record<string, string>;
  syscall(name: string, args: Record<string, unknown>): Promise<unknown>;
  channel: Channel;
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

### Window API

Object-oriented API for creating and managing windows:

```typescript
// Create a window
const window = await os.window.create({
  title: 'My App',
  width: 800,
  height: 600,
  workspaceId: 'workspace-1'
});

// Synchronous property access (cached)
window.width = 1000;
window.height = 800;
window.x = 100;
window.y = 100;
window.size = { width: 1200, height: 900 };
window.position = { x: 50, y: 50 };

// Asynchronous methods
await window.setWidth(1000);
await window.setHeight(800);
const width = await window.getWidth();

// Window actions
await window.close();
await window.minimize();
await window.maximize();
await window.restore();
await window.focus();
```

### Clipboard API

Read and write clipboard data:

```typescript
// Read/write text
const text = await os.clipboard.readText();
await os.clipboard.writeText('Hello, World!');

// Read/write arbitrary data
const data = await os.clipboard.read();
await os.clipboard.write({
  type: 'text',
  data: 'Some text'
});

// Check clipboard content
const hasText = await os.clipboard.hasText();
const hasImage = await os.clipboard.hasImage();

// Clear clipboard
await os.clipboard.clear();
```

### Power API

Manage power state and battery information:

```typescript
// Wake lock management
const acquired = await os.power.requestWakeLock('screen');
await os.power.releaseWakeLock();
const isActive = await os.power.isWakeLockActive();

// Battery status
const battery = await os.power.getBatteryStatus();
// Returns: { charging: boolean, level: number, chargingTime: number | null, dischargingTime: number | null, supported: boolean }

const isOnBattery = await os.power.isOnBattery();
const batteryLevel = await os.power.getBatteryLevel(); // 0-1
```

### Audio API

Play audio files and generate sounds:

```typescript
// Play audio from URL
const audioId = await os.audio.play('https://example.com/sound.mp3', {
  volume: 0.8,
  loop: false,
  playbackRate: 1.0
});

// Control playback
await os.audio.pause(audioId);
await os.audio.resume(audioId);
await os.audio.stop(audioId);

// Volume control
await os.audio.setVolume(audioId, 0.5);
const volume = await os.audio.getVolume(audioId);

// System beep
await os.audio.beep(440, 200); // frequency (Hz), duration (ms)
```

### Media API

Access camera and microphone:

```typescript
// Request media access
const { streamId, tracks } = await os.media.getUserMedia({
  video: true,
  audio: true
});

// Stop stream
await os.media.stopStream(streamId);
await os.media.stopAllStreams();

// Enumerate devices
const devices = await os.media.enumerateDevices();
// Returns: [{ deviceId, kind, label, groupId }, ...]
```

### Location API

Get geolocation information:

```typescript
// Get current position
const position = await os.location.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});
// Returns: { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed, timestamp }
```

### Sensor API

Access device sensors (accelerometer, gyroscope, magnetometer):

```typescript
// Check support
const supported = await os.sensor.isSupported();

// Accelerometer
await os.sensor.startAccelerometer({ frequency: 60 });
await os.sensor.stopAccelerometer();

// Gyroscope
await os.sensor.startGyroscope({ frequency: 60 });
await os.sensor.stopGyroscope();

// Magnetometer
await os.sensor.startMagnetometer({ frequency: 60 });
await os.sensor.stopMagnetometer();

// Stop all sensors
await os.sensor.stopAll();
```

### Print API

Print content:

```typescript
// Print HTML content
await os.print.printHTML('<h1>Hello</h1><p>World</p>', {
  silent: false,
  printBackground: true
});

// Print current window
await os.print.printWindow();

// Print URL
await os.print.printURL('https://example.com/page.html');
```

### Other APIs

- **Notification API**: Show system notifications
- **Dialog API**: Display modal dialogs
- **Storage API**: LocalStorage and sessionStorage access
- **Process API**: Spawn and manage child processes
- **Network API**: HTTP requests via fetch
- **System Info API**: Get system information

