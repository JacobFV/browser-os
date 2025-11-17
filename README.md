# browser-os

A browser-based operating system monorepo built with React, TypeScript, and Turbo.

## Overview

browser-os provides a complete OS-in-a-tab experience - a fully functional operating system that runs entirely in the browser. It features window management, a virtual filesystem, process management, and a complete app ecosystem.

### Key Features

- **Kernel Architecture**: Central kernel orchestrates all system modules with syscall routing and security
- **Process Management**: Full process lifecycle with IPC, sandboxing, and monitoring
- **Virtual Filesystem**: Multiple backend drivers (IndexedDB, localStorage, ephemeral memory, server)
- **Window Management**: Multi-workspace windowing system with drag/resize, focus management
- **App Registry**: App installation, metadata tracking, and lifecycle management
- **Event System**: Centralized event bus for IPC and pub/sub communication
- **Workspace Management**: Multiple virtual workspaces with keyboard shortcuts
- **Taskbar**: Desktop taskbar with app shortcuts, window management, and workspace overview

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

```bash
pnpm install
```

## Structure

```text
browser-os/
├── apps/
│   └── desktop-shell/      # Desktop shell application (React + Vite)
├── packages/
│   ├── events/             # Event bus system for IPC and pub/sub
│   ├── fs/                 # Virtual filesystem with multiple backends
│   ├── kernel/             # Kernel with syscall routing and security
│   ├── os/                 # OS component (Desktop + Workspace + Taskbar)
│   ├── proc/               # Process lifecycle management
│   ├── schemas/            # Zod schemas and TypeScript types
│   ├── taskbar/            # Taskbar component with shortcuts
│   ├── windowing/          # Window management system
│   ├── workspace/          # Workspace management with keyboard shortcuts
│   ├── clipboard/          # Clipboard management
│   ├── power/              # Power management (wake locks, battery)
│   ├── audio/              # Audio playback and beep sounds
│   ├── media/              # Camera and microphone access
│   ├── location/           # Geolocation services
│   ├── sensor/             # Device sensors (accelerometer, gyroscope, magnetometer)
│   └── print/              # Print functionality
└── system-apps/            # System applications (placeholder)
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start desktop shell (main OS interface)
pnpm --filter @browser-os/desktop-shell dev

# Run tests
pnpm test
```

## Architecture

### Core Concepts

**Kernel**: Central orchestrator that manages filesystem, process manager, app registry, and syscall routing. All system operations go through the kernel's permission system.

**Process Management**: Apps run as processes with sandboxed execution. Each process has a PID, IPC channel, and controlled access to system resources via syscalls.

**Filesystem**: Virtual filesystem with Unix-like structure (`/bin`, `/etc`, `/home`, `/tmp`, etc.) supporting multiple storage backends.

**Windowing**: Multi-workspace windowing system where windows belong to workspaces and can be moved, resized, focused, and managed.

**Event Bus**: Centralized event system for IPC between processes and general pub/sub communication.

### Package Dependencies

```text
events (core IPC/pub-sub)
  ↓
fs, kernel, proc, app-registry, schemas
  ↓
windowing, workspace, taskbar
  ↓
os (composes windowing + workspace + taskbar)
  ↓
desktop-shell (uses os component)
```

See individual package READMEs for detailed API documentation.

## Documentation

### Getting Started
- [Getting Started Guide](./docs/GETTING_STARTED.md) - Quick start guide for new developers
- [API Usage Guide](./docs/API_USAGE.md) - Comprehensive API examples and usage
- [App Development Guide](./docs/APP_DEVELOPMENT.md) - Complete guide to building apps

### Reference
- [Quick Reference](./docs/QUICK_REFERENCE.md) - API cheat sheet
- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed system architecture and design
- [Best Practices](./docs/BEST_PRACTICES.md) - Recommended patterns and practices
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Development
- [Developing Guide](./docs/DEVELOPING.md) - Development setup and contributing

## Packages

Each package has its own README with detailed API documentation:

- [@browser-os/events](./packages/events/README.md) - Event bus system
- [@browser-os/fs](./packages/fs/README.md) - Virtual filesystem
- [@browser-os/kernel](./packages/kernel/README.md) - Kernel and syscalls
- [@browser-os/proc](./packages/proc/README.md) - Process management
- [@browser-os/app-registry](./packages/app-registry/README.md) - App registry
- [@browser-os/schemas](./packages/schemas/README.md) - Type schemas
- [@browser-os/clipboard](./packages/clipboard/README.md) - Clipboard management
- [@browser-os/power](./packages/power/README.md) - Power management
- [@browser-os/audio](./packages/audio/README.md) - Audio playback
- [@browser-os/media](./packages/media/README.md) - Media access
- [@browser-os/location](./packages/location/README.md) - Geolocation
- [@browser-os/sensor](./packages/sensor/README.md) - Device sensors
- [@browser-os/print](./packages/print/README.md) - Print functionality

## License

MIT - See [LICENSE](./LICENSE) file for details
