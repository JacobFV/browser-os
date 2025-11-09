# @browser-os/app-host

App sandboxing system for browser-os.

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

if (appHost.checkCapability('my-app', 'fs.write')) {
  // Allow write operation
} else {
  // Deny or request permission
}
```

## Security Model

- **Untrusted Apps**: Run in iframes with restricted postMessage IPC, CSP enforcement, capability guards, rate limiting
- **Trusted Apps**: Run in regular divs with direct DOM access, full IPC access, no CSP restrictions

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
    if (appHost.checkCapability(appId, event.data.topic)) {
      // Process request
    }
  }
});
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

