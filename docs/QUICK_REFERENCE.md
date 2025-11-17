# Quick Reference

Cheat sheet for Browser OS APIs and common patterns.

## Window API

```javascript
// Create
const w = await os.window.create({
  title: 'App', width: 800, height: 600, workspaceId: 'workspace-1'
});

// Properties (sync, cached)
w.width = 1000;
w.height = 800;
w.x = 100; w.y = 100;
w.size = { width: 1200, height: 900 };
w.position = { x: 50, y: 50 };
const id = w.id; // Window ID

// Methods (async, fresh)
await w.setWidth(1000);
await w.getWidth();
await w.refresh(); // Refresh cached state
await w.focus();
await w.minimize();
await w.maximize();
await w.restore();
await w.close();
```

## Clipboard API

```javascript
// Text
await os.clipboard.writeText('Hello');
const text = await os.clipboard.readText();
const hasText = await os.clipboard.hasText();

// Data
await os.clipboard.write({ type: 'text', data: 'Hello' });
const data = await os.clipboard.read();
await os.clipboard.clear();
```

## Power API

```javascript
// Wake lock
const active = await os.power.requestWakeLock('screen');
await os.power.releaseWakeLock();
const isActive = await os.power.isWakeLockActive();

// Battery
const battery = await os.power.getBatteryStatus();
const onBattery = await os.power.isOnBattery();
const level = await os.power.getBatteryLevel(); // 0-1
```

## Audio API

```javascript
// Play
const id = await os.audio.play('url.mp3', { volume: 0.8, loop: false });

// Control
await os.audio.pause(id);
await os.audio.resume(id);
await os.audio.stop(id);
await os.audio.setVolume(id, 0.5);
const vol = await os.audio.getVolume(id);

// Beep
await os.audio.beep(440, 200); // freq (Hz), duration (ms)
```

## Media API

```javascript
// Request
const { streamId, tracks } = await os.media.getUserMedia({
  video: true, audio: true
});

// Stop
await os.media.stopStream(streamId);
await os.media.stopAllStreams();

// Devices
const devices = await os.media.enumerateDevices();
```

## Location API

```javascript
const pos = await os.location.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});
// pos.latitude, pos.longitude, pos.accuracy, etc.
```

## Sensor API

```javascript
// Check
const supported = await os.sensor.isSupported();

// Start
await os.sensor.startAccelerometer({ frequency: 60 });
await os.sensor.startGyroscope({ frequency: 60 });
await os.sensor.startMagnetometer({ frequency: 60 });

// Stop
await os.sensor.stopAccelerometer();
await os.sensor.stopGyroscope();
await os.sensor.stopMagnetometer();
await os.sensor.stopAll();

// Listen (via events)
os.channel.on('sensor:accelerometer', (reading) => {
  // reading.x, reading.y, reading.z, reading.timestamp
});
```

## Print API

```javascript
// HTML (note: printHTML with capital HTML)
await os.print.printHTML('<h1>Hello</h1>', { printBackground: true });

// Window
await os.print.printWindow();

// URL
await os.print.printURL('https://example.com');
```

## Notification API

```javascript
// Show (returns Notification object)
const notif = await os.notification.show({
  title: 'Title',
  message: 'Message', // Note: 'message' not 'body'
  icon: '🔔',
  priority: 'normal'
});

// Manage
await notif.markAsRead();
await notif.dismiss();
await os.notification.dismissAll();
const count = await os.notification.getUnreadCount();
```

## Dialog API

```javascript
// Alert (message, options?)
await os.dialog.alert('Message', { title: 'Alert', icon: 'info' });

// Confirm (message, options?)
const ok = await os.dialog.confirm('Sure?', { title: 'Confirm' });

// Prompt (message, defaultValue?, options?)
const input = await os.dialog.prompt('Enter value', 'default', {
  title: 'Input',
  placeholder: 'Type here'
});

// File dialogs
const files = await os.dialog.openFile({ title: 'Select File' });
const file = await os.dialog.saveFile({ title: 'Save File' });
const dir = await os.dialog.openDirectory({ title: 'Select Directory' });
```

## Storage API

```javascript
// Unified storage (not separate localStorage/sessionStorage)
await os.storage.set('key', 'value');
const value = await os.storage.get('key');
await os.storage.remove('key');
await os.storage.clear();
const keys = await os.storage.keys();
const exists = await os.storage.has('key');
const size = await os.storage.size();

// JSON helpers
await os.storage.setJSON('key', { data: 'value' });
const data = await os.storage.getJSON('key');
```

## Process API

```javascript
// Get current process
const self = await os.process.getSelf();

// Get process by PID
const proc = await os.process.get(pid);

// List processes
const procs = await os.process.list();

// Get environment
const env = await os.process.getEnv();

// Spawn/Kill via syscall
const result = await os.syscall('proc.spawn', {
  appId: 'app-id', args: ['arg1'], options: {}
});
await os.syscall('proc.kill', { pid, signal: 'SIGTERM' });
```

## Network API

```javascript
// GET
const res = await os.network.get('https://api.example.com/data', {
  headers: { 'Authorization': 'Bearer token' }
});

// POST (url, body?, options?)
const res = await os.network.post(
  'https://api.example.com/data',
  JSON.stringify({ name: 'John' }),
  { headers: { 'Content-Type': 'application/json' } }
);

// Request (url, options?)
const res = await os.network.request('https://api.example.com/data', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'value' })
});
// res.status, res.statusText, res.headers, res.body, res.ok
```

## System Info API

```javascript
// Get all info
const info = await os.system.getInfo();
// info.platform, info.userAgent, info.language, info.screenWidth, info.screenHeight, etc.

// Individual methods
const platform = await os.system.getPlatform();
const screenSize = await os.system.getScreenSize(); // { width, height }
const isOnline = await os.system.isOnline();
const cores = await os.system.getHardwareConcurrency();
```

## File System

```javascript
// Read
const data = await os.syscall('fs.read', { path: '/file.txt' });

// Write
await os.syscall('fs.write', { path: '/file.txt', data: 'content' });

// List
const files = await os.syscall('fs.readdir', { path: '/home/user' });

// Stat
const stat = await os.syscall('fs.stat', { path: '/file.txt' });

// Exists
const exists = await os.syscall('fs.exists', { path: '/file.txt' });

// Delete
await os.syscall('fs.delete', { path: '/file.txt' });

// Mkdir
await os.syscall('fs.mkdir', { path: '/home/user/newdir' });
```

## Common Patterns

### Error Handling

```javascript
try {
  const result = await os.someAPI.method();
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

### Cleanup

```javascript
let resource = null;
try {
  resource = await os.someAPI.start();
  // Use resource
} finally {
  if (resource) {
    await os.someAPI.stop(resource);
  }
}
```

### React Hook

```javascript
function useOS() {
  const os = useContext(OSContext);
  if (!os) throw new Error('useOS must be used within OSProvider');
  return os;
}
```

### Window Lifecycle

```javascript
const window = await os.window.create({ /* ... */ });
window.onclose = () => {
  // Cleanup
};
```

## Browser Requirements

- **HTTPS Required:** Clipboard, Media, Location, Sensors
- **User Gesture:** Some APIs require user interaction
- **Permissions:** Browser will prompt for sensitive APIs

## Error Codes

- `1` - Permission denied
- `2` - Position unavailable
- `3` - Timeout
- `NotAllowedError` - Permission denied
- `NotFoundError` - Resource not found
- `NotSupportedError` - Feature not supported

## Quick Tips

- Use async methods for guaranteed updates
- Use sync properties for UI updates (cached is fine)
- Always handle errors
- Clean up resources (sensors, streams, wake locks)
- Check browser support before using features
- Request permissions with user interaction

