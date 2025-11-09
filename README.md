# browser-os

A comprehensive browser-based operating system monorepo built with React, TypeScript, and Turbo.

## Overview

browser-os provides a complete OS-in-a-tab experience - a fully functional operating system that runs entirely in the browser. It features desktop and mobile modes, window management, a virtual filesystem, process management, and a complete app ecosystem.

### Key Features

- **Desktop & Mobile Shells**: Seamlessly switch between desktop and mobile modes
- **Advanced Windowing**: Floating windows with snap-to-grid, drag/resize, and multi-workspace support
- **Virtual Filesystem**: Multiple backend drivers (IndexedDB, OPFS, Memory, localStorage)
- **Process Management**: Full process lifecycle with IPC and monitoring
- **App System**: Sandboxed apps with capability-based permissions
- **Theme System**: Multiple skins (Win95, macOS, Monaco, Glass) with runtime switching
- **Built-in Apps**: Files, Terminal, Editor, Browser, Notes, Calendar, Settings, Store, Monitor
- **Real-time Collaboration**: Optional cursor presence and multi-user support via Yjs

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

```bash
pnpm install
```

## Structure

```
browser-os/
├── apps/
│   ├── web-shell/          # React OS shell (web)
│   ├── electron-shell/     # Electron wrapper
│   └── showcase/           # Component gallery
├── packages/
│   ├── core/               # Event bus, IDs, Zod contracts
│   ├── ui/                 # Primitive components
│   ├── theme/              # Theme tokens and skins
│   ├── windowing/          # Window management
│   ├── workspace/          # Workspace management
│   ├── taskbar/            # Taskbar and app switcher
│   ├── desktop/            # Desktop and icons
│   ├── process/            # Process management
│   ├── fs/                 # Virtual filesystem
│   ├── shell/              # Desktop/mobile shell
│   ├── app-sdk/            # App SDK
│   ├── app-host/           # App sandboxing
│   ├── cursor/             # Cursor and presence
│   ├── net/                # Network abstraction
│   ├── notif/              # Notifications
│   ├── settings/            # Settings store
│   └── telemetry/          # Metrics and logging
├── system-apps/
│   ├── files/              # File manager
│   ├── terminal/           # Terminal
│   ├── editor/             # Monaco editor
│   ├── browser/            # Web browser
│   ├── notes/             # Notes app
│   ├── calendar/          # Calendar
│   ├── settings/          # Settings panel
│   ├── store/             # App store
│   └── monitor/           # Process monitor
└── examples/
    ├── basic-windowing/   # Windowing example
    ├── theme-switching/   # Theme example
    └── custom-app/        # Custom app example
```

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev
```

### Running Applications

```bash
# Web shell (main OS interface)
pnpm --filter @browser-os/web-shell dev

# Showcase (component gallery)
pnpm --filter @browser-os/showcase dev

# Electron shell
pnpm --filter @browser-os/electron-shell dev
```

### Working with Packages

```bash
# Build a specific package
pnpm --filter @browser-os/core build

# Watch mode for a package
pnpm --filter @browser-os/windowing dev

# Run tests
pnpm test
```

## Features

### Windowing System
- Floating windows with drag/resize
- Snap-to-grid and snap-to-edges
- Window arrangement patterns (grid, stack, monocle)
- Z-order management
- Multi-workspace support

### Process Management
- Process lifecycle (starting → running → suspended → stopped)
- IPC system
- Process monitoring
- Crash isolation

### Virtual Filesystem
- Multiple drivers: mem, idb, opfs, localStorage
- Mount system
- File watching
- Quota management

### Themes
- Win95 skin
- macOS skin
- Monaco skin
- Glass skin
- Runtime theme switching

### Mobile Mode
- Fullscreen app cards
- App switcher
- Home screen grid
- Gesture support

## Architecture

### Core Concepts

**Desktop Shell**: Composed of windowing + desktop + taskbar + workspaces + app host + process manager + fs + cursor + theme.

**Apps**: Packages exposing a manifest + React entry point. Installable & updatable via the app store.

**Modes**:
- **Desktop Mode**: XY window positioning, taskbar at bottom/top
- **Mobile Mode**: Full-screen cards, app switcher replaces taskbar, desktop grid = home screen

### Package Dependencies

```
core → windowing → workspace, taskbar, desktop
core → process → app-sdk → app-host
core → fs, cursor, net, notif, settings, telemetry
shell → windowing + taskbar + desktop
```

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed system architecture
- [App Development Guide](./docs/APP_DEVELOPMENT.md) - Building apps for browser-os
- [Contributing Guide](./docs/CONTRIBUTING.md) - Contributing to the project

## Package Documentation

- [@browser-os/core](./packages/core/README.md) - Core utilities and event bus
- [@browser-os/windowing](./packages/windowing/README.md) - Window management system
- [@browser-os/fs](./packages/fs/README.md) - Virtual filesystem
- [@browser-os/process](./packages/process/README.md) - Process management
- [@browser-os/app-sdk](./packages/app-sdk/README.md) - App SDK and manifest

## Examples

Check out the [examples](./examples/) directory for:
- Basic windowing examples
- Theme switching demos
- Custom app development

## License

MIT
