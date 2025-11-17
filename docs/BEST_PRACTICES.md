# Best Practices Guide

Recommended patterns and practices for building applications on Browser OS.

## Table of Contents

- [Window Management](#window-management)
- [Error Handling](#error-handling)
- [Resource Management](#resource-management)
- [Performance](#performance)
- [Security](#security)
- [User Experience](#user-experience)
- [Code Organization](#code-organization)

## Window Management

### Window Lifecycle

```javascript
// ✅ Good: Properly manage window lifecycle
export default async function main(os) {
  const window = await os.window.create({
    title: 'My App',
    width: 800,
    height: 600,
    workspaceId: 'workspace-1'
  });
  
  // Set up cleanup on window close
  window.onclose = async () => {
    // Clean up resources
    await cleanup();
  };
  
  // Your app code...
}

// ❌ Bad: Don't create windows without cleanup
export default async function main(os) {
  const window = await os.window.create({ /* ... */ });
  // No cleanup - windows may leak
}
```

### Window State Management

```javascript
// ✅ Good: Use async methods when you need fresh data
const currentWidth = await window.getWidth();
const currentHeight = await window.getHeight();

// ✅ Good: Use sync properties for UI updates (cached is fine)
window.width = newWidth;  // Fast, uses cached value
window.height = newHeight;

// ❌ Bad: Don't assume sync properties are always fresh
const width = window.width;  // May be stale if window was moved externally
```

### Window Positioning

```javascript
// ✅ Good: Center window on screen
const screenInfo = await os.system.getInfo();
const screenWidth = screenInfo.screenWidth;
const screenHeight = screenInfo.screenHeight;
const windowWidth = 800;
const windowHeight = 600;

window.x = (screenWidth - windowWidth) / 2;
window.y = (screenHeight - windowHeight) / 2;

// ✅ Good: Remember user's preferred position
const savedPosition = await os.storage.getJSON('windowPosition');
if (savedPosition) {
  const { x, y } = savedPosition;
  window.x = x;
  window.y = y;
}
```

## Error Handling

### Always Handle Errors

```javascript
// ✅ Good: Comprehensive error handling
async function loadData() {
  try {
    const data = await os.syscall('fs.read', { path: '/data/file.json' });
    return JSON.parse(data);
  } catch (error) {
    if (error.message.includes('not found')) {
      // File doesn't exist - return default
      return { default: true };
    } else if (error.message.includes('permission')) {
      // Permission denied - show error to user
      await os.dialog.alert('Cannot read file. Check permissions.', {
        title: 'Permission Denied'
      });
      throw error;
    } else {
      // Unexpected error - log and rethrow
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

// ❌ Bad: No error handling
async function loadData() {
  const data = await os.syscall('fs.read', { path: '/data/file.json' });
  return JSON.parse(data);  // Will crash if file doesn't exist
}
```

### Permission Checks

```javascript
// ✅ Good: Check permissions before using APIs
async function requestLocation() {
  try {
    const position = await os.location.getCurrentPosition({
      timeout: 5000
    });
    return position;
  } catch (error) {
    if (error.message.includes('permission')) {
      // User denied permission
      const retry = await os.dialog.confirm('This app needs location access. Would you like to grant permission?', {
        title: 'Location Permission Required'
      });
      if (retry) {
        return requestLocation(); // Retry
      }
    }
    throw error;
  }
}
```

### Graceful Degradation

```javascript
// ✅ Good: Provide fallbacks when APIs aren't available
async function playSound(url) {
  try {
    return await os.audio.play(url);
  } catch (error) {
    // Fallback to beep if audio file fails
    console.warn('Failed to play audio file, using beep:', error);
    await os.audio.beep(440, 200);
  }
}

// ✅ Good: Check support before using features
async function useSensors() {
  const supported = await os.sensor.isSupported();
  if (!supported) {
    console.log('Sensors not available, using alternative method');
    // Use alternative approach
    return;
  }
  
  await os.sensor.startAccelerometer();
}
```

## Resource Management

### Clean Up Resources

```javascript
// ✅ Good: Always clean up resources
export default async function main(os) {
  let audioId = null;
  let streamId = null;
  
  try {
    // Start resources
    audioId = await os.audio.play('background.mp3', { loop: true });
    const { streamId: id } = await os.media.getUserMedia({ video: true });
    streamId = id;
    
    // Use resources...
    
  } finally {
    // Always clean up
    if (audioId) {
      os.audio.stop(audioId);
    }
    if (streamId) {
      os.media.stopStream(streamId);
    }
  }
}

// ❌ Bad: Resources leak if app crashes
export default async function main(os) {
  const audioId = await os.audio.play('background.mp3');
  const { streamId } = await os.media.getUserMedia({ video: true });
  // If app crashes, resources aren't cleaned up
}
```

### Stop Sensors When Not Needed

```javascript
// ✅ Good: Stop sensors when app loses focus
const window = await os.window.create({ /* ... */ });

window.onblur = async () => {
  // Stop sensors to save battery
  await os.sensor.stopAll();
};

window.onfocus = async () => {
  // Restart sensors when app gains focus
  await os.sensor.startAccelerometer();
};
```

### Release Wake Locks

```javascript
// ✅ Good: Release wake locks when not needed
let wakeLockActive = false;

async function startVideo() {
  wakeLockActive = await os.power.requestWakeLock('screen');
  // Play video...
}

async function stopVideo() {
  if (wakeLockActive) {
    await os.power.releaseWakeLock();
    wakeLockActive = false;
  }
  // Stop video...
}
```

## Performance

### Debounce Frequent Updates

```javascript
// ✅ Good: Debounce window resize updates
let resizeTimeout;
window.onresize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    const width = await window.getWidth();
    const height = await window.getHeight();
    // Update UI with new dimensions
    updateLayout(width, height);
  }, 100);
};
```

### Batch Operations

```javascript
// ✅ Good: Batch multiple updates
async function updateWindowSize(width, height) {
  // Both updates happen together
  window.width = width;
  window.height = height;
  // Or use async if you need confirmation
  await Promise.all([
    window.setWidth(width),
    window.setHeight(height)
  ]);
}

// ❌ Bad: Multiple separate updates
async function updateWindowSize(width, height) {
  await window.setWidth(width);   // One syscall
  await window.setHeight(height); // Another syscall
}
```

### Cache When Appropriate

```javascript
// ✅ Good: Cache expensive operations
let cachedSystemInfo = null;

async function getSystemInfo() {
  if (!cachedSystemInfo) {
    cachedSystemInfo = await os.system.getInfo();
  }
  return cachedSystemInfo;
}
```

## Security

### Validate User Input

```javascript
// ✅ Good: Validate file paths
function readFile(path) {
  // Prevent directory traversal
  if (path.includes('..')) {
    throw new Error('Invalid path');
  }
  
  // Ensure path is within allowed directory
  if (!path.startsWith('/home/user/')) {
    throw new Error('Access denied');
  }
  
  return os.syscall('fs.read', { path });
}
```

### Don't Trust Client Data

```javascript
// ✅ Good: Validate data from storage
async function loadUserData() {
  const data = await os.storage.getJSON('userData');
  if (!data) {
    return null;
  }
  
  try {
    // Validate structure
    if (typeof data !== 'object' || !data.id) {
      throw new Error('Invalid data format');
    }
    return data;
  } catch (error) {
    // Corrupted data - clear it
    await os.storage.remove('userData');
    return null;
  }
}
```

### Handle Sensitive Data Carefully

```javascript
// ✅ Good: Clear sensitive data from clipboard after use
async function copyPassword(password) {
  await os.clipboard.writeText(password);
  
  // Clear after 30 seconds
  setTimeout(async () => {
    await os.clipboard.clear();
  }, 30000);
}

// ❌ Bad: Leave sensitive data in clipboard
async function copyPassword(password) {
  await os.clipboard.writeText(password);
  // Password stays in clipboard indefinitely
}
```

## User Experience

### Provide Feedback

```javascript
// ✅ Good: Show loading states
async function loadData() {
  showLoadingSpinner();
  try {
    const data = await os.syscall('fs.read', { path: '/data.json' });
    hideLoadingSpinner();
    displayData(data);
  } catch (error) {
    hideLoadingSpinner();
    showError('Failed to load data');
  }
}
```

### Handle Long Operations

```javascript
// ✅ Good: Show progress for long operations
async function processLargeFile() {
    await os.notification.show({
      title: 'Processing',
      message: 'Processing large file...',
      icon: '⏳'
    });
    
    try {
      // Process file...
      await os.notification.show({
        title: 'Complete',
        message: 'File processed successfully',
        icon: '✅'
      });
    } catch (error) {
      await os.notification.show({
        title: 'Error',
        message: 'Failed to process file',
        icon: '❌'
      });
    }
}
```

### Request Permissions Appropriately

```javascript
// ✅ Good: Request permissions when needed, with explanation
async function requestCamera() {
  try {
    const { streamId } = await os.media.getUserMedia({ video: true });
    return streamId;
  } catch (error) {
    // Explain why permission is needed
    const retry = await os.dialog.confirm({
      title: 'Camera Access Required',
      message: 'This app needs camera access to take photos. Please grant permission and try again.'
    });
    
    if (retry) {
      return requestCamera();
    }
    throw error;
  }
}
```

## Code Organization

### Modular Structure

```javascript
// ✅ Good: Organize code into modules
// app.js
import { WindowManager } from './window-manager.js';
import { DataManager } from './data-manager.js';

export default async function main(os) {
  const windowManager = new WindowManager(os);
  const dataManager = new DataManager(os);
  
  await windowManager.initialize();
  await dataManager.load();
  
  // App logic...
}

// window-manager.js
export class WindowManager {
  constructor(os) {
    this.os = os;
    this.window = null;
  }
  
  async initialize() {
    this.window = await this.os.window.create({ /* ... */ });
  }
}
```

### Use Constants

```javascript
// ✅ Good: Define constants
const CONFIG = {
  DEFAULT_WINDOW_WIDTH: 800,
  DEFAULT_WINDOW_HEIGHT: 600,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  CLIPBOARD_CLEAR_DELAY: 30000 // 30 seconds
};

const window = await os.window.create({
  width: CONFIG.DEFAULT_WINDOW_WIDTH,
  height: CONFIG.DEFAULT_WINDOW_HEIGHT
});
```

### Error Messages

```javascript
// ✅ Good: User-friendly error messages
const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'The file could not be found.',
  PERMISSION_DENIED: 'You do not have permission to access this resource.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.'
};

try {
  await loadFile();
} catch (error) {
  const message = ERROR_MESSAGES[error.code] || 'An unexpected error occurred.';
  await os.dialog.alert({ title: 'Error', message });
}
```

## Testing

### Test Error Cases

```javascript
// ✅ Good: Test error handling
describe('loadFile', () => {
  it('should handle file not found', async () => {
    await expect(loadFile('/nonexistent.txt')).rejects.toThrow('not found');
  });
  
  it('should handle permission denied', async () => {
    // Mock permission error
    await expect(loadFile('/restricted.txt')).rejects.toThrow('permission');
  });
});
```

### Mock APIs for Testing

```javascript
// ✅ Good: Mock OS APIs in tests
const mockOS = {
  window: {
    create: jest.fn().mockResolvedValue({ id: 'window-1' })
  },
  clipboard: {
    readText: jest.fn().mockResolvedValue('test')
  }
};

test('app creates window', async () => {
  await main(mockOS);
  expect(mockOS.window.create).toHaveBeenCalled();
});
```

## Summary

- **Always handle errors** - APIs can fail for many reasons
- **Clean up resources** - Stop sensors, media streams, wake locks
- **Provide user feedback** - Loading states, error messages, confirmations
- **Validate input** - Don't trust user data or storage
- **Request permissions appropriately** - Explain why you need them
- **Organize code** - Use modules, constants, and clear structure
- **Test thoroughly** - Especially error cases

Following these practices will help you build robust, user-friendly applications on Browser OS.

