# Troubleshooting Guide

Common issues and solutions when developing for Browser OS.

## Table of Contents

- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [API Issues](#api-issues)
- [Permission Issues](#permission-issues)
- [Performance Issues](#performance-issues)
- [Window Issues](#window-issues)
- [File System Issues](#file-system-issues)

## Build Issues

### "Cannot find module '@browser-os/...'"

**Problem:** TypeScript can't find a workspace package.

**Solutions:**
1. Ensure package is listed in `pnpm-workspace.yaml`
2. Run `pnpm install` to update lockfile
3. Build the dependency package first: `pnpm --filter @browser-os/package-name build`
4. Check package name matches exactly (case-sensitive)

```bash
# Rebuild everything
pnpm clean
pnpm install
pnpm build
```

### Build Fails with Type Errors

**Problem:** TypeScript compilation errors.

**Solutions:**
1. Check TypeScript version compatibility
2. Ensure all dependencies are built: `pnpm build`
3. Clear build cache: `pnpm clean && pnpm build`
4. Check `tsconfig.json` extends root config correctly

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Turbo Cache Issues

**Problem:** Build cache is stale or corrupted.

**Solutions:**
```bash
# Clear Turbo cache
pnpm turbo clean

# Or rebuild without cache
pnpm build --force
```

## Runtime Errors

### "Window not found"

**Problem:** Trying to access a window that doesn't exist or was closed.

**Solutions:**
```javascript
// ✅ Good: Check if window exists
const window = await os.window.create({ /* ... */ });
if (!window) {
  throw new Error('Failed to create window');
}

// ✅ Good: Handle window close
window.onclose = () => {
  // Clean up references
  window = null;
};

// ❌ Bad: Using window after close
window.close();
window.width = 100; // Error: window is closed
```

### "Process spawn failed"

**Problem:** Cannot spawn a process.

**Solutions:**
1. Check app is registered in `/etc/registry.json`
2. Verify executable path exists: `/bin/app-id.js`
3. Check app code exports default function correctly
4. Verify permissions allow `proc.spawn`

```javascript
// ✅ Good: Handle spawn errors
try {
  const result = await os.syscall('proc.spawn', {
    appId: 'my-app',
    args: [],
    options: {}
  });
  console.log('Process spawned:', result.pid);
} catch (error) {
  console.error('Failed to spawn app:', error.message);
  // Show error to user
}
```

### "Syscall permission denied"

**Problem:** Process doesn't have permission for syscall.

**Solutions:**
1. Check process permissions in kernel
2. Request permission in app manifest
3. Handle permission errors gracefully

```javascript
// ✅ Good: Handle permission errors
try {
  await os.clipboard.readText();
} catch (error) {
  if (error.message.includes('permission')) {
    await os.dialog.alert({
      title: 'Permission Required',
      message: 'This app needs clipboard access.'
    });
  }
}
```

## API Issues

### Clipboard API Not Working

**Problem:** Clipboard operations fail.

**Solutions:**
1. **HTTPS Required:** Clipboard API requires HTTPS (except localhost)
2. **User Interaction:** Some browsers require user gesture
3. **Permissions:** Check browser permissions

```javascript
// ✅ Good: Request clipboard in response to user action
button.onclick = async () => {
  try {
    await os.clipboard.writeText('Hello');
  } catch (error) {
    console.error('Clipboard error:', error);
  }
};
```

### Audio Not Playing

**Problem:** Audio files don't play.

**Solutions:**
1. **Browser Autoplay Policy:** Browsers block autoplay - require user interaction
2. **CORS:** Audio URL must allow CORS
3. **Format Support:** Check browser supports audio format

```javascript
// ✅ Good: Play audio after user interaction
button.onclick = async () => {
  try {
    const audioId = await os.audio.play('sound.mp3');
  } catch (error) {
    console.error('Audio error:', error);
    // Fallback to beep
    await os.audio.beep(440, 200);
  }
};
```

### Media Access Denied

**Problem:** Camera/microphone access fails.

**Solutions:**
1. **HTTPS Required:** Media APIs require HTTPS
2. **User Permission:** Browser will prompt - user must allow
3. **Device Availability:** Check device exists

```javascript
// ✅ Good: Handle media errors
try {
  const { streamId } = await os.media.getUserMedia({ video: true });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    await os.dialog.alert({
      title: 'Permission Denied',
      message: 'Camera access was denied. Please grant permission.'
    });
  } else if (error.name === 'NotFoundError') {
    await os.dialog.alert({
      title: 'No Camera',
      message: 'No camera found on this device.'
    });
  }
}
```

### Location API Fails

**Problem:** Geolocation doesn't work.

**Solutions:**
1. **HTTPS Required:** Location API requires HTTPS
2. **User Permission:** Browser will prompt
3. **Timeout:** Increase timeout for slow GPS

```javascript
// ✅ Good: Handle location errors
try {
  const position = await os.location.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
} catch (error) {
  if (error.code === 1) { // PERMISSION_DENIED
    await os.dialog.alert({
      title: 'Location Denied',
      message: 'Location access was denied.'
    });
  } else if (error.code === 2) { // POSITION_UNAVAILABLE
    await os.dialog.alert({
      title: 'Location Unavailable',
      message: 'Unable to determine location.'
    });
  } else if (error.code === 3) { // TIMEOUT
    await os.dialog.alert({
      title: 'Timeout',
      message: 'Location request timed out.'
    });
  }
}
```

### Sensors Not Working

**Problem:** Sensor APIs fail.

**Solutions:**
1. **Browser Support:** Check browser supports Generic Sensor API
2. **HTTPS Required:** Sensors require HTTPS
3. **Device Support:** Device may not have sensors

```javascript
// ✅ Good: Check support first
const supported = await os.sensor.isSupported();
if (!supported) {
  console.log('Sensors not supported');
  // Use alternative approach
  return;
}

try {
  await os.sensor.startAccelerometer();
} catch (error) {
  console.error('Sensor error:', error);
}
```

## Permission Issues

### "Permission denied" Errors

**Problem:** App doesn't have required permissions.

**Solutions:**
1. **Check Manifest:** Ensure permissions listed in app manifest
2. **Request Permission:** Some APIs require user interaction
3. **Handle Gracefully:** Provide fallback when permission denied

```javascript
// ✅ Good: Request permission with explanation
async function requestPermission() {
  try {
    await os.media.getUserMedia({ video: true });
  } catch (error) {
    const retry = await os.dialog.confirm({
      title: 'Permission Required',
      message: 'This app needs camera access. Please grant permission.'
    });
    if (retry) {
      return requestPermission();
    }
    throw error;
  }
}
```

## Performance Issues

### App Runs Slowly

**Problem:** App performance is poor.

**Solutions:**
1. **Stop Unused Sensors:** Sensors consume battery
2. **Release Wake Locks:** When not needed
3. **Debounce Updates:** Don't update UI too frequently
4. **Use React.memo:** Prevent unnecessary re-renders

```javascript
// ✅ Good: Clean up resources
window.onblur = async () => {
  await os.sensor.stopAll();
  await os.power.releaseWakeLock();
};

window.onfocus = async () => {
  // Restart only if needed
};
```

### Memory Leaks

**Problem:** App memory usage grows over time.

**Solutions:**
1. **Clean Up Event Listeners:** Remove listeners on unmount
2. **Stop Media Streams:** Don't leave streams running
3. **Clear Intervals:** Clear timers and intervals

```javascript
// ✅ Good: Clean up on unmount
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => {
    clearInterval(interval);
  };
}, []);
```

## Window Issues

### Window Doesn't Appear

**Problem:** Window created but not visible.

**Solutions:**
1. **Check Workspace:** Ensure workspace exists
2. **Check Z-Index:** Window may be behind others
3. **Focus Window:** Call `window.focus()`

```javascript
// ✅ Good: Ensure window is visible
const window = await os.window.create({ /* ... */ });
await window.focus(); // Bring to front
```

### Window Properties Don't Update

**Problem:** Window size/position changes don't apply.

**Solutions:**
1. **Use Async Methods:** For guaranteed updates
2. **Refresh State:** Call `window.refresh()` if needed
3. **Check Constraints:** Min/max size may prevent update

```javascript
// ✅ Good: Use async methods for important updates
await window.setWidth(1000);
await window.setHeight(800);

// ✅ Good: Refresh if needed
await window.refresh();
const currentWidth = window.width;
```

## File System Issues

### "File not found"

**Problem:** Cannot read/write file.

**Solutions:**
1. **Check Path:** Ensure path is correct
2. **Check Permissions:** Process may not have access
3. **Create Directory:** Ensure parent directory exists

```javascript
// ✅ Good: Check file exists first
try {
  const exists = await os.syscall('fs.exists', { path: '/file.txt' });
  if (!exists) {
    // Create file
    await os.syscall('fs.write', { path: '/file.txt', data: '' });
  } else {
    // Read file
    const content = await os.syscall('fs.read', { path: '/file.txt' });
  }
} catch (error) {
  console.error('File error:', error);
}
```

### "Permission denied" on File Operations

**Problem:** Cannot access file system paths.

**Solutions:**
1. **Check Process Permissions:** Verify `fsAccess` permissions
2. **Use Allowed Paths:** Only access paths in `fsAccess` list
3. **Request Permission:** Some paths require explicit permission

## Debugging Tips

### Enable Debug Logging

```javascript
// Add debug logging
console.log('Window created:', window.id);
console.log('Current state:', await window.getState());
```

### Use Browser DevTools

1. **Console:** Check for errors and logs
2. **Network:** Monitor syscall requests
3. **Application:** Inspect IndexedDB (filesystem)
4. **Performance:** Profile app performance

### Check Event Bus

```javascript
// Listen to all events
os.channel.on('*', (event, data) => {
  console.log('Event:', event, data);
});
```

## Getting Help

If you're still stuck:

1. **Check Documentation:** Review API docs and guides
2. **Look at Examples:** Check system apps for reference
3. **Search Issues:** Look for similar problems
4. **Ask Community:** Get help from other developers

## Common Error Codes

- **Permission Denied (1):** User denied permission
- **Position Unavailable (2):** Location cannot be determined
- **Timeout (3):** Request timed out
- **NotAllowedError:** Permission denied by browser
- **NotFoundError:** Resource not found (device, file, etc.)
- **NotSupportedError:** Feature not supported by browser

## Summary

Most issues can be resolved by:
1. **Checking browser support** for APIs
2. **Ensuring HTTPS** (for sensitive APIs)
3. **Handling errors** gracefully
4. **Requesting permissions** appropriately
5. **Cleaning up resources** properly

When in doubt, check the browser console for detailed error messages!

