# API Usage Guide

Comprehensive guide to using Browser OS APIs in your applications.

## Table of Contents

- [Window API](#window-api)
- [Clipboard API](#clipboard-api)
- [Power API](#power-api)
- [Audio API](#audio-api)
- [Media API](#media-api)
- [Location API](#location-api)
- [Sensor API](#sensor-api)
- [Print API](#print-api)
- [Notification API](#notification-api)
- [Dialog API](#dialog-api)
- [Storage API](#storage-api)
- [Process API](#process-api)
- [Network API](#network-api)
- [System Info API](#system-info-api)

## Window API

### Creating Windows

```javascript
// Basic window
const window = await os.window.create({
  title: 'My App',
  width: 800,
  height: 600,
  workspaceId: 'workspace-1'
});

// Window with constraints
const window = await os.window.create({
  title: 'My App',
  width: 800,
  height: 600,
  minWidth: 400,
  minHeight: 300,
  maxWidth: 1920,
  maxHeight: 1080,
  workspaceId: 'workspace-1',
  resizable: true,
  movable: true,
  closable: true,
  minimizable: true,
  maximizable: true
});
```

### Updating Window Properties

```javascript
// Synchronous (cached) - fast but may be stale
window.width = 1000;
window.height = 800;
window.x = 100;
window.y = 100;
window.size = { width: 1200, height: 900 };
window.position = { x: 50, y: 50 };

// Asynchronous - always fresh
await window.setWidth(1000);
await window.setHeight(800);
const width = await window.getWidth();
const height = await window.getHeight();
const position = await window.getPosition();
```

### Window Actions

```javascript
// Focus the window
await window.focus();

// Minimize
await window.minimize();

// Maximize
await window.maximize();

// Restore from minimized/maximized
await window.restore();

// Close
await window.close();
```

### Window State Management

```javascript
// Refresh window state from server
await window.refresh();

// Get current state (cached)
const width = window.width;
const height = window.height;
const windowId = window.id; // Get window ID

// Get full state via refresh
await window.refresh();
// State is stored in cachedState internally, access via properties
```

## Clipboard API

### Text Operations

```javascript
// Read text
const text = await os.clipboard.readText();
console.log('Clipboard:', text);

// Write text
await os.clipboard.writeText('Hello, World!');

// Check if clipboard has text
const hasText = await os.clipboard.hasText();
```

### Arbitrary Data

```javascript
// Read clipboard data
const data = await os.clipboard.read();
if (data) {
  console.log('Type:', data.type);
  console.log('Data:', data.data);
}

// Write text data
await os.clipboard.write({
  type: 'text',
  data: 'Some text content'
});

// Write image data
await os.clipboard.write({
  type: 'image',
  data: imageBytes, // Uint8Array
  mimeType: 'image/png'
});
```

### Clipboard Utilities

```javascript
// Clear clipboard
await os.clipboard.clear();

// Check for image
const hasImage = await os.clipboard.hasImage();
```

## Power API

### Wake Lock Management

```javascript
// Request wake lock (prevent screen sleep)
const acquired = await os.power.requestWakeLock('screen');
if (acquired) {
  console.log('Screen will not sleep');
}

// Check if wake lock is active
const isActive = await os.power.isWakeLockActive();

// Release wake lock
await os.power.releaseWakeLock();
```

### Battery Information

```javascript
// Get full battery status
const battery = await os.power.getBatteryStatus();
if (battery && battery.supported) {
  console.log(`Battery: ${(battery.level * 100).toFixed(0)}%`);
  console.log(`Charging: ${battery.charging}`);
  console.log(`Charging time: ${battery.chargingTime}s`);
  console.log(`Discharging time: ${battery.dischargingTime}s`);
}

// Quick checks
const isOnBattery = await os.power.isOnBattery();
const batteryLevel = await os.power.getBatteryLevel(); // 0-1
```

## Audio API

### Playing Audio Files

```javascript
// Play audio with options
const audioId = await os.audio.play('https://example.com/sound.mp3', {
  volume: 0.8,        // 0-1
  loop: false,
  playbackRate: 1.0   // 1.0 = normal speed
});

// Play with loop
const musicId = await os.audio.play('https://example.com/music.mp3', {
  volume: 0.5,
  loop: true
});
```

### Playback Control

```javascript
// Pause
await os.audio.pause(audioId);

// Resume
await os.audio.resume(audioId);

// Stop (resets to beginning)
await os.audio.stop(audioId);
```

### Volume Control

```javascript
// Set volume (0-1)
await os.audio.setVolume(audioId, 0.5); // 50%

// Get volume
const volume = await os.audio.getVolume(audioId);
console.log(`Volume: ${(volume * 100).toFixed(0)}%`);
```

### System Sounds

```javascript
// Play beep (frequency in Hz, duration in ms)
await os.audio.beep(440, 200);  // A4 note for 200ms
await os.audio.beep(523, 200);  // C5 note
await os.audio.beep(659, 200);  // E5 note
```

## Media API

### Requesting Media Access

```javascript
// Request both video and audio
const { streamId, tracks } = await os.media.getUserMedia({
  video: true,
  audio: true
});

// Request video only with constraints
const { streamId, tracks } = await os.media.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user' // 'user' | 'environment'
  },
  audio: false
});

// Request audio only
const { streamId, tracks } = await os.media.getUserMedia({
  video: false,
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  }
});
```

### Using Media Streams

```javascript
// Get stream info
const { streamId, tracks } = await os.media.getUserMedia({
  video: true,
  audio: true
});

console.log('Stream ID:', streamId);
tracks.forEach(track => {
  console.log(`${track.kind}: ${track.label} (${track.id})`);
});

// Attach to video element (if you have access to DOM)
// const video = document.createElement('video');
// video.srcObject = stream; // You'd need to get the native MediaStream
// video.play();
```

### Stopping Streams

```javascript
// Stop specific stream
await os.media.stopStream(streamId);

// Stop all streams
await os.media.stopAllStreams();
```

### Enumerating Devices

```javascript
// List available devices
const devices = await os.media.enumerateDevices();

devices.forEach(device => {
  console.log(`${device.kind}: ${device.label}`);
  console.log(`  Device ID: ${device.deviceId}`);
  console.log(`  Group ID: ${device.groupId}`);
});
```

## Location API

### Getting Current Position

```javascript
// Basic usage
const position = await os.location.getCurrentPosition();

console.log(`Latitude: ${position.latitude}`);
console.log(`Longitude: ${position.longitude}`);
console.log(`Accuracy: ${position.accuracy}m`);
```

### Position Options

```javascript
// High accuracy with timeout
const position = await os.location.getCurrentPosition({
  enableHighAccuracy: true,  // Use GPS if available
  timeout: 10000,            // 10 second timeout
  maximumAge: 0             // Don't use cached position
});

// Use cached position if available
const position = await os.location.getCurrentPosition({
  enableHighAccuracy: false,
  maximumAge: 60000  // Accept position up to 1 minute old
});
```

### Position Data

```javascript
const position = await os.location.getCurrentPosition();

// Basic coordinates
position.latitude;   // Number
position.longitude;  // Number
position.accuracy;   // Number (meters)

// Optional data (may be null)
position.altitude;           // Number (meters) | null
position.altitudeAccuracy;   // Number (meters) | null
position.heading;            // Number (degrees 0-360) | null
position.speed;              // Number (m/s) | null
position.timestamp;          // Number (ms since epoch)
```

## Sensor API

### Checking Support

```javascript
// Check if sensors are supported
const supported = await os.sensor.isSupported();
if (!supported) {
  console.log('Sensors not supported on this device');
}
```

### Accelerometer

```javascript
// Start accelerometer
await os.sensor.startAccelerometer({ frequency: 60 }); // 60 Hz

// Listen for readings (via events)
os.channel.on('sensor:accelerometer', (reading) => {
  console.log(`X: ${reading.x} m/s²`);
  console.log(`Y: ${reading.y} m/s²`);
  console.log(`Z: ${reading.z} m/s²`);
  console.log(`Time: ${reading.timestamp}ms`);
});

// Stop
await os.sensor.stopAccelerometer();
```

### Gyroscope

```javascript
// Start gyroscope
await os.sensor.startGyroscope({ frequency: 60 });

// Listen for readings
os.channel.on('sensor:gyroscope', (reading) => {
  console.log(`Rotation: ${reading.x}, ${reading.y}, ${reading.z} rad/s`);
});

// Stop
await os.sensor.stopGyroscope();
```

### Magnetometer

```javascript
// Start magnetometer
await os.sensor.startMagnetometer({ frequency: 10 });

// Listen for readings
os.channel.on('sensor:magnetometer', (reading) => {
  console.log(`Magnetic field: ${reading.x}, ${reading.y}, ${reading.z} μT`);
});

// Stop
await os.sensor.stopMagnetometer();
```

### Stopping All Sensors

```javascript
// Stop all active sensors at once
await os.sensor.stopAll();
```

## Print API

### Printing HTML Content

```javascript
// Print HTML string
await os.print.printHTML(`
  <html>
    <head>
      <title>My Document</title>
      <style>
        body { font-family: Arial; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>Hello, World!</h1>
      <p>This is a test document.</p>
    </body>
  </html>
`, {
  printBackground: true,
  margin: {
    top: '1in',
    bottom: '1in',
    left: '1in',
    right: '1in'
  }
});
```

### Printing Current Window

```javascript
// Print the current window
await os.print.printWindow({
  printBackground: true,
  silent: false  // Show print dialog
});
```

### Printing from URL

```javascript
// Print content from a URL
await os.print.printURL('https://example.com/document.html', {
  silent: false
});
```

## Notification API

### Showing Notifications

```javascript
// Basic notification (returns Notification object)
const notification = await os.notification.show({
  title: 'Hello',
  message: 'This is a notification', // Note: 'message' not 'body'
  icon: '🔔'
});

// Notification with options
const notification = await os.notification.show({
  title: 'Task Complete',
  message: 'Your download has finished',
  icon: '✅',
  priority: 'high', // 'low' | 'normal' | 'high' | 'urgent'
  actions: [
    { label: 'Open', action: 'open' },
    { label: 'Dismiss', action: 'dismiss' }
  ]
});

// Notification management
await notification.markAsRead();
await notification.dismiss();

// Bulk operations
await os.notification.dismissAll();
await os.notification.markAllAsRead();
const unreadCount = await os.notification.getUnreadCount();
```

## Dialog API

### Alert Dialog

```javascript
// alert(message, options?)
await os.dialog.alert('Something important happened!', {
  title: 'Alert',
  icon: 'info' // 'info' | 'warning' | 'error' | 'success'
});
```

### Confirm Dialog

```javascript
// confirm(message, options?)
const confirmed = await os.dialog.confirm('Are you sure you want to delete this file?', {
  title: 'Confirm',
  icon: 'warning',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
});

if (confirmed) {
  // User clicked OK
} else {
  // User clicked Cancel
}
```

### Prompt Dialog

```javascript
// prompt(message, defaultValue?, options?)
const result = await os.dialog.prompt('What is your name?', 'Anonymous', {
  title: 'Enter Name',
  placeholder: 'Type your name here',
  inputType: 'text', // 'text' | 'password' | 'number'
  confirmLabel: 'OK',
  cancelLabel: 'Cancel'
});

if (result !== null) {
  console.log('User entered:', result);
} else {
  console.log('User cancelled');
}
```

### File Dialogs

```javascript
// Open file dialog
const files = await os.dialog.openFile({
  title: 'Select File',
  filters: [
    { name: 'Images', extensions: ['png', 'jpg', 'gif'] },
    { name: 'All Files', extensions: ['*'] }
  ],
  multiple: true
});

// Save file dialog
const file = await os.dialog.saveFile({
  title: 'Save File',
  defaultPath: '/home/user/document.txt',
  filters: [
    { name: 'Text Files', extensions: ['txt'] }
  ]
});

// Open directory dialog
const directory = await os.dialog.openDirectory({
  title: 'Select Directory',
  defaultPath: '/home/user'
});
```

## Storage API

The Storage API provides a unified storage interface (not separate localStorage/sessionStorage):

```javascript
// Set item
await os.storage.set('key', 'value');

// Get item
const value = await os.storage.get('key');

// Remove item
await os.storage.remove('key');

// Clear all
await os.storage.clear();

// Get all keys
const keys = await os.storage.keys();

// Check if key exists
const exists = await os.storage.has('key');

// Get storage size (number of keys)
const size = await os.storage.size();

// JSON helpers
await os.storage.setJSON('key', { name: 'John', age: 30 });
const data = await os.storage.getJSON('key');
```

## Process API

### Process Information

```javascript
// Get current process info
const self = await os.process.getSelf();
console.log('PID:', self.pid);
console.log('Name:', self.name);
console.log('Status:', self.status);
console.log('CWD:', self.cwd);

// Get process info by PID
const proc = await os.process.get(processId);

// List all processes (may only return own process if no permission)
const processes = await os.process.list();

// Get environment variables
const env = await os.process.getEnv();
console.log('Environment:', env);
```

### Spawning Processes

To spawn processes, use the syscall directly:

```javascript
// Spawn a process via syscall
const result = await os.syscall('proc.spawn', {
  appId: 'my-app',
  args: ['arg1', 'arg2'],
  options: {
    cwd: '/home/user',
    env: { NODE_ENV: 'production' }
  }
});
const processId = result.pid;

// Kill process via syscall
await os.syscall('proc.kill', {
  pid: processId,
  signal: 'SIGTERM'
});
```

## Network API

### Making Requests

```javascript
// GET request
const response = await os.network.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token'
  }
});

// POST request
const response = await os.network.post(
  'https://api.example.com/data',
  JSON.stringify({ name: 'John', age: 30 }), // body as string
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

// Custom request
const response = await os.network.request('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'value' })
});

// Response structure
console.log('Status:', response.status);
console.log('Status Text:', response.statusText);
console.log('Headers:', response.headers);
console.log('Body:', response.body); // string or Uint8Array
console.log('OK:', response.ok);
```

## System Info API

### Getting System Information

```javascript
// Get all system info
const info = await os.system.getInfo();

console.log('Platform:', info.platform);
console.log('User Agent:', info.userAgent);
console.log('Language:', info.language);
console.log('Languages:', info.languages);
console.log('Timezone:', info.timezone);
console.log('Screen:', info.screenWidth, 'x', info.screenHeight);
console.log('Color Depth:', info.colorDepth);
console.log('Pixel Ratio:', info.pixelRatio);
console.log('Online:', info.online);
console.log('Hardware Concurrency:', info.hardwareConcurrency);

// Individual methods
const platform = await os.system.getPlatform();
const userAgent = await os.system.getUserAgent();
const language = await os.system.getLanguage();
const languages = await os.system.getLanguages();
const timezone = await os.system.getTimezone();
const screenSize = await os.system.getScreenSize(); // { width, height }
const isOnline = await os.system.isOnline();
const cores = await os.system.getHardwareConcurrency();
```

## Error Handling

Always handle errors when using APIs:

```javascript
try {
  const position = await os.location.getCurrentPosition();
  console.log('Position:', position);
} catch (error) {
  console.error('Failed to get location:', error.message);
  // Handle error (show message to user, use fallback, etc.)
}

try {
  const { streamId } = await os.media.getUserMedia({ video: true });
  // Use stream
} catch (error) {
  console.error('Failed to access camera:', error.message);
  // User denied permission or device not available
}
```

## Best Practices

1. **Always check permissions** - Some APIs require user permission
2. **Handle errors gracefully** - APIs may fail due to permissions, device support, etc.
3. **Clean up resources** - Stop sensors, media streams, etc. when done
4. **Use async/await** - All API methods are async
5. **Check browser support** - Some APIs may not be available in all browsers

For more details, see the [Best Practices Guide](./BEST_PRACTICES.md).

