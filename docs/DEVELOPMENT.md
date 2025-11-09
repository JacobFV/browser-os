# App Development Guide

This guide will help you create applications for browser-os.

## Overview

Apps in browser-os are React components that run in a sandboxed environment with controlled access to system resources. They can be installed, updated, and managed through the app store.

## Creating Your First App

### 1. Create App Structure

```bash
mkdir my-app
cd my-app
```

Create `package.json`:

```json
{
  "name": "@browser-os/app-myapp",
  "version": "1.0.0",
  "main": "manifest.ts",
  "dependencies": {
    "@browser-os/app-sdk": "workspace:*",
    "react": "^18.2.0"
  }
}
```

### 2. Create App Component

`src/App.tsx`:

```typescript
import React from 'react';
import { AppContext } from '@browser-os/app-sdk';

interface Props {
  context: AppContext;
  payload?: Record<string, any>;
}

export const MyApp: React.FC<Props> = ({ context, payload }) => {
  return (
    <div>
      <h1>Hello from {context.appId}!</h1>
      <p>Process ID: {context.pid}</p>
    </div>
  );
};
```

### 3. Create Manifest

`manifest.ts`:

```typescript
import { AppManifest } from '@browser-os/app-sdk';
import { MyApp } from './src/App';

export const manifest: AppManifest = {
  id: 'com.example.myapp',
  name: 'My App',
  version: '1.0.0',
  icon: 'data:image/svg+xml;base64,...',
  entry: async () => MyApp,
  defaultWindow: {
    w: 800,
    h: 600,
    resizable: true,
  },
  permissions: ['fs.read'],
};
```

## App Manifest

### Required Fields

- **id**: Unique identifier (e.g., `com.example.myapp`)
- **name**: Display name
- **version**: Semantic version
- **icon**: Data URL or path to icon
- **entry**: Async function returning React component

### Optional Fields

- **background**: Background worker function
- **defaultWindow**: Default window size and properties
- **permissions**: Array of required capabilities
- **intents**: Intent patterns the app can handle

## Capabilities

### Requesting Capabilities

```typescript
export const manifest: AppManifest = {
  // ...
  permissions: [
    'fs.read',      // Read files
    'fs.write',     // Write files
    'net.fetch',    // HTTP requests
    'clipboard',    // Clipboard access
  ],
};
```

### Checking Capabilities

```typescript
function MyApp({ context }: { context: AppContext }) {
  const canWrite = context.permissions.includes('fs.write');
  
  if (!canWrite) {
    return <div>Write permission required</div>;
  }
  
  // Use fs.write capability
}
```

## Using System APIs

### Filesystem

```typescript
import { vfs } from '@browser-os/fs';

// Read file
const content = await vfs.read('vfs://home/documents/file.txt');

// Write file
await vfs.write('vfs://home/documents/file.txt', 'Hello!');
```

### Process Management

```typescript
import { spawn, send } from '@browser-os/process';

// Spawn child process
const pid = spawn('another-app');

// Send IPC message
send(pid, 'topic', { data: 'hello' });
```

### Notifications

```typescript
import { showNotification } from '@browser-os/notif';

showNotification('Hello!', {
  body: 'This is a notification',
  icon: 'data:image/png;base64,...',
});
```

## Intent Handling

Apps can register to handle specific intents:

```typescript
export const manifest: AppManifest = {
  // ...
  intents: ['open://text/*', 'view://image/*'],
};

// In your app component
function MyApp({ payload }: { payload?: Record<string, any> }) {
  const uri = payload?.uri;
  
  useEffect(() => {
    if (uri?.startsWith('open://text/')) {
      const filePath = uri.replace('open://text/', '');
      // Handle text file opening
    }
  }, [uri]);
  
  return <div>...</div>;
}
```

## Background Workers

Apps can run background workers:

```typescript
export const manifest: AppManifest = {
  // ...
  background: async () => {
    // Setup
    const interval = setInterval(() => {
      // Background task
      console.log('Background task running');
    }, 5000);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  },
};
```

## Window Management

Apps can control their windows:

```typescript
import { windowManager } from '@browser-os/windowing';

// Get current window (from context)
const window = windowManager.windows.get(context.winId);

// Request window resize
windowManager.resizeWindow(window.id, 1000, 800);
```

## Best Practices

### 1. Minimal Permissions

Only request capabilities you actually need:

```typescript
// ❌ Bad
permissions: ['fs.read', 'fs.write', 'net.fetch', 'clipboard', 'camera']

// ✅ Good
permissions: ['fs.read', 'fs.write']
```

### 2. Error Handling

Handle capability denials gracefully:

```typescript
try {
  await vfs.write('vfs://home/file.txt', 'data');
} catch (error) {
  if (error.message.includes('permission')) {
    // Show user-friendly error
  }
}
```

### 3. Resource Cleanup

Clean up resources on unmount:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // ...
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

### 4. Performance

- Use React.memo for expensive components
- Lazy load heavy dependencies
- Debounce frequent operations
- Virtualize long lists

### 5. Accessibility

- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Respect reduced motion preferences

## Testing Your App

### Local Testing

```bash
# Build your app
pnpm build

# Test in web-shell
pnpm --filter @browser-os/web-shell dev
```

### Unit Tests

```typescript
import { render } from '@testing-library/react';
import { MyApp } from './App';

test('renders app', () => {
  const context = {
    appId: 'test-app',
    pid: 'pid-123',
    permissions: [],
  };
  
  render(<MyApp context={context} />);
  // Assertions
});
```

## Publishing Your App

1. Build your app
2. Create app manifest JSON
3. Submit to app store
4. Users can install via store app

## Examples

See the [examples](../examples/) directory for:
- Basic app structure
- Intent handling
- Background workers
- System API usage

## Resources

- [App SDK Documentation](../packages/app-sdk/README.md)
- [Process Management](../packages/process/README.md)
- [Filesystem API](../packages/fs/README.md)
- [Windowing System](../packages/windowing/README.md)

