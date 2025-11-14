# @browser-os/app-registry

App metadata and installation tracking.

## Overview

Manages the app registry stored in `/etc/registry.json`. Tracks installed apps, their manifests, and installation metadata.

## Usage

```typescript
import { AppRegistry, Installer } from '@browser-os/app-registry';
import { FileSystem } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';

const fs = new FileSystem();
const eventBus = new EventBus();
const registry = new AppRegistry({ fs, eventBus });

// Load registry
await registry.load();

// List apps
const allApps = registry.list();
const enabledApps = registry.getEnabled();

// Get app
const app = registry.get('my-app');
const isInstalled = registry.isInstalled('my-app');

// Install app
const installer = new Installer({
  registry,
  fs,
  eventBus,
  userId: 'user-1',
});

await installer.install(
  'my-app',
  appCode,
  {
    id: 'my-app',
    name: 'My App',
    version: '1.0.0',
    entrypoint: '/bin/my-app.js',
    permissions: ['fs.read', 'fs.write'],
  },
  { enabled: true }
);

// Uninstall
await installer.uninstall('my-app');

// Enable/disable
await installer.enable('my-app');
await installer.disable('my-app');
```

## Registry Format

Stored in `/etc/registry.json`:

```json
[
  {
    "id": "my-app",
    "installedAt": 1234567890,
    "installedBy": "user-1",
    "enabled": true,
    "manifest": {
      "id": "my-app",
      "name": "My App",
      "version": "1.0.0",
      "entrypoint": "/bin/my-app.js",
      "permissions": ["fs.read", "fs.write"]
    }
  }
]
```

