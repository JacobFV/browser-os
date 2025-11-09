# @browser-os/app-host

App host and sandboxing system for browser-os.

## Installation

```bash
pnpm add @browser-os/app-host
```

## Features

- **Sandboxing**: Run untrusted apps in iframes
- **Capability Guards**: Enforce permission checks
- **CSP Enforcement**: Content Security Policy for apps
- **IPC Bridge**: Secure postMessage communication

## Usage

### Creating Sandboxes

```typescript
import { appHost } from '@browser-os/app-host';

// Create iframe sandbox
const container = appHost.createSandbox('my-app', {
  iframe: true,
  capabilities: ['fs.read', 'fs.write'],
  csp: "default-src 'self'",
});

// Create regular div (trusted app)
const trustedContainer = appHost.createSandbox('trusted-app', {
  iframe: false,
});
```

### Checking Capabilities

```typescript
import { appHost } from '@browser-os/app-host';

// Check if app has capability
if (appHost.checkCapability('my-app', 'fs.write')) {
  // Allow write operation
} else {
  // Deny or request permission
}
```

## Sandbox Options

```typescript
interface SandboxOptions {
  iframe?: boolean;           // Use iframe sandbox
  capabilities?: Capability[]; // Allowed capabilities
  csp?: string;              // Content Security Policy
}
```

## Security Model

### Untrusted Apps

Untrusted apps run in iframes with:
- Restricted postMessage IPC
- CSP enforcement
- Capability guards
- Rate limiting

### Trusted Apps

Trusted apps can run in regular divs:
- Direct DOM access
- Full IPC access
- No CSP restrictions

## IPC Bridge

Apps communicate via postMessage:

```typescript
// In app (iframe)
window.parent.postMessage({
  type: 'ipc',
  topic: 'fs.read',
  payload: { path: 'vfs://home/file.txt' },
}, '*');

// In host
window.addEventListener('message', (event) => {
  if (event.data.type === 'ipc') {
    // Handle IPC message
    if (appHost.checkCapability(appId, event.data.topic)) {
      // Process request
    }
  }
});
```

## Capability Guards

Capabilities are checked before operations:

```typescript
function writeFile(appId: string, path: string, data: string) {
  if (!appHost.checkCapability(appId, 'fs.write')) {
    throw new Error('Permission denied: fs.write');
  }
  
  // Perform write operation
  vfs.write(path, data);
}
```

## Rate Limiting

Apps are rate-limited to prevent abuse:
- IPC message limits
- File operation limits
- Network request limits

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

