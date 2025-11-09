# Electron Shell

Electron wrapper for browser-os web-shell.

## Overview

The Electron Shell provides a native desktop application wrapper for browser-os, enabling:
- Native file system access
- System integrations
- Desktop app distribution

## Features

- **Native Wrapper**: Electron-based desktop app
- **File System**: Access to native file system
- **System Integration**: Native OS integrations
- **Distribution**: Package as desktop app

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start web-shell dev server
pnpm --filter @browser-os/web-shell dev

# In another terminal, run electron shell
pnpm --filter @browser-os/electron-shell dev
```

### Building

```bash
# Build web-shell first
pnpm --filter @browser-os/web-shell build

# Build electron app
pnpm --filter @browser-os/electron-shell build
```

## Configuration

The Electron shell loads the web-shell:
- Development: `http://localhost:3000`
- Production: Built web-shell from `../web-shell/dist`

## Native Features

- File system access via Electron APIs
- Native dialogs
- System tray
- Auto-updater (future)

## Distribution

Package for distribution:
```bash
pnpm --filter @browser-os/electron-shell build
```

Outputs platform-specific installers in `dist/`.

