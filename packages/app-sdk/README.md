# @browser-os/app-sdk

App SDK for developing applications for browser-os.

## Installation

```bash
pnpm add @browser-os/app-sdk
```

## Features

- **App Manifest**: Define app metadata and capabilities
- **App Lifecycle**: Mount/unmount hooks
- **Capability System**: Request permissions for system resources
- **Intent System**: Handle `open://` and `view://` intents
- **Type Safety**: Full TypeScript support with Zod validation

## Quick Start

### Creating an App

```typescript
import { AppManifest } from '@browser-os/app-sdk';
import React from 'react';

const MyApp: React.FC = () => {
  return <div>Hello from my app!</div>;
};

export const manifest: AppManifest = {
  id: 'com.example.myapp',
  name: 'My App',
  version: '1.0.0',
  icon: 'data:image/png;base64,...',
  entry: async () => MyApp,
  defaultWindow: {
    w: 800,
    h: 600,
    resizable: true,
  },
  permissions: ['fs.read', 'fs.write'],
  intents: ['open://text/*', 'view://image/*'],
};
```

### App Manifest Schema

```typescript
interface AppManifest {
  id: string;              // Unique app identifier
  name: string;             // Display name
  version: string;          // Semantic version
  icon: string;             // Data URL or static path
  entry: () => Promise<React.ComponentType<any>>;
  background?: () => Promise<() => void>; // Optional background worker
  defaultWindow?: {
    w: number;
    h: number;
    resizable?: boolean;
  };
  permissions?: Capability[]; // Required capabilities
  intents?: string[];        // Intent patterns
}
```

## Capabilities

Apps must declare required capabilities:

```typescript
type Capability =
  | 'fs.read'           // Read files
  | 'fs.write'          // Write files
  | 'net.fetch'          // HTTP requests
  | 'net.ws'             // WebSocket connections
  | 'clipboard'          // Clipboard access
  | 'notifications'     // Show notifications
  | 'camera'            // Camera access
  | 'mic'               // Microphone access
  | 'rtc'               // WebRTC
  | 'proc.spawn'         // Spawn processes
  | 'proc.ipc';          // IPC communication
```

## App Lifecycle

```typescript
import { createAppContext } from '@browser-os/app-sdk';

// App receives context on mount
function MyApp({ context }: { context: AppContext }) {
  const { appId, pid, permissions } = context;
  
  // Check if capability is available
  const canWrite = permissions.includes('fs.write');
  
  return <div>App ID: {appId}</div>;
}
```

## Intent Handling

Apps can register intent handlers:

```typescript
export const manifest: AppManifest = {
  // ...
  intents: ['open://text/*', 'view://image/*'],
};

// In your app component
function MyApp({ payload }: { payload?: Record<string, any> }) {
  const uri = payload?.uri;
  if (uri?.startsWith('open://text/')) {
    // Handle text file opening
  }
  // ...
}
```

## Background Workers

Apps can run background workers:

```typescript
export const manifest: AppManifest = {
  // ...
  background: async () => {
    // Setup background worker
    const interval = setInterval(() => {
      console.log('Background task running...');
    }, 5000);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  },
};
```

## Validating Manifests

```typescript
import { validateManifest, AppManifestSchema } from '@browser-os/app-sdk';

// Validate manifest
if (validateManifest(manifest)) {
  console.log('Manifest is valid');
}

// Or use Zod directly
try {
  const validated = AppManifestSchema.parse(manifest);
} catch (error) {
  console.error('Invalid manifest:', error);
}
```

## App Context

Apps receive an `AppContext` object:

```typescript
interface AppContext {
  appId: string;
  pid: string;
  permissions: Capability[];
}
```

## Best Practices

1. **Minimal Permissions**: Only request capabilities you actually need
2. **Error Handling**: Handle capability denials gracefully
3. **Resource Cleanup**: Clean up timers, listeners, etc. on unmount
4. **Intent Patterns**: Use specific intent patterns for better UX
5. **Versioning**: Follow semantic versioning for app updates

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

