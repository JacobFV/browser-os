# Architecture

This document describes the architecture of browser-os, a browser-based operating system built with React, TypeScript, and a modular monorepo structure.

## Overview

browser-os is designed as a layered system where each layer builds upon the previous one:

1. **Core Layer**: Event bus, filesystem, kernel, process management
2. **System Layer**: Windowing, workspace management, taskbar
3. **UI Layer**: OS component that composes system components
4. **Application Layer**: Desktop shell and system apps

## Core Architecture

### Event Bus (`@browser-os/events`)

The event bus is the foundation of inter-component communication. It provides:

- **Pub/Sub**: General event publishing and subscribing
- **IPC Channels**: Named channels for inter-process communication
- **Request/Response**: Async request-response pattern for RPC-like calls

All components communicate through the event bus, ensuring loose coupling and testability.

### Kernel (`@browser-os/kernel`)

The kernel is the central orchestrator that:

- **Initializes System**: Sets up filesystem, loads configuration, registers syscalls
- **Routes Syscalls**: All system operations go through the kernel's syscall router
- **Enforces Security**: Permission checks before every syscall
- **Manages Modules**: Provides access to filesystem, process manager, app registry

#### Initialization Sequence

1. Initialize filesystem with default mounts (IndexedDB for `/`, ephemeral for `/tmp`)
2. Create default directory structure (`/bin`, `/etc`, `/home/user`, etc.)
3. Load system configuration from `/etc/config.json`
4. Load app registry from `/etc/registry.json`
5. Register syscall handlers (fs, proc, registry)
6. Set up default permissions
7. Emit `kernel:ready` event

#### Syscalls

Syscalls are the interface between processes and the kernel:

- **Filesystem**: `fs.read`, `fs.write`, `fs.delete`, `fs.mkdir`, `fs.readdir`, `fs.stat`, `fs.exists`
- **Process**: `proc.spawn`, `proc.kill`, `proc.list`, `proc.get`
- **Registry**: `registry.list`, `registry.get`, `registry.isInstalled`

All syscalls are permission-checked before execution.

### Filesystem (`@browser-os/fs`)

Virtual filesystem with Unix-like structure:

```
/
├── bin/          # Executable apps
├── etc/          # System configuration
├── home/         # User directories
│   └── user/
│       ├── Documents/
│       ├── Downloads/
│       └── ...
├── tmp/          # Temporary files (ephemeral)
├── var/          # Variable data
│   ├── log/      # Logs
│   └── cache/    # Cache
└── sys/          # System information
```

#### Backends

Multiple storage backends are supported:

- **IndexedDBBackend**: Persistent storage with large capacity (default for `/`)
- **LocalStorageBackend**: Persistent storage with limited capacity
- **EphemeralBackend**: In-memory storage (cleared on reload, default for `/tmp`)
- **ServerBackend**: HTTP API backend for remote storage

Backends are mounted at specific paths, allowing different storage strategies for different directories.

### Process Management (`@browser-os/proc`)

Processes represent running applications:

- **Lifecycle**: Spawn, run, terminate
- **Sandboxing**: Processes run in isolated environments
- **IPC**: Each process has an IPC channel for communication
- **Syscalls**: Processes access system resources via syscalls

When a process is spawned:
1. App code is loaded from `/bin/<app-id>.js`
2. Process instance is created with PID
3. IPC channel is created
4. Code is executed in sandboxed environment with `os` API
5. Process runs until termination

### App Registry (`@browser-os/app-registry`)

Manages installed applications:

- **Metadata**: Tracks app manifests, installation info
- **Installation**: Install/uninstall apps
- **Enable/Disable**: Control which apps are available
- **Storage**: Registry stored in `/etc/registry.json`

## System Layer

### Windowing (`@browser-os/windowing`)

Window management system:

- **Window Registry**: Tracks all windows
- **Window State**: Position, size, z-index, state (normal/minimized/maximized)
- **Focus Management**: Window focus and activation
- **Workspace Association**: Windows belong to workspaces

Windows are created by apps and managed by the WindowManager. The manager handles:
- Window creation/destruction
- Position and size changes
- Focus changes
- State transitions (minimize, maximize, restore)

### Workspace Management (`@browser-os/workspace`)

Multi-workspace system:

- **Multiple Workspaces**: Default 4 workspaces, can create more
- **Window Isolation**: Windows belong to specific workspaces
- **Switching**: Keyboard shortcuts to switch between workspaces
- **Overview**: Visual overview of all workspaces

Workspaces provide virtual desktops, allowing users to organize windows across multiple spaces.

### Taskbar (`@browser-os/taskbar`)

Desktop taskbar component:

- **Window Buttons**: Shows buttons for open windows
- **App Shortcuts**: Quick launch shortcuts for apps
- **Workspace Overview**: Button to view all workspaces
- **Search Bar**: Search functionality (placeholder)

The taskbar provides the primary interface for window and app management.

## UI Layer

### OS Component (`@browser-os/os`)

The OS component composes the system layer:

- **Desktop**: Desktop background component
- **Workspace**: Active workspace with windows
- **Taskbar**: Taskbar at bottom

The OS component initializes:
1. Event bus
2. Filesystem with IndexedDB backend
3. App registry
4. Window manager
5. Workspace manager

It then renders the desktop shell with workspace and taskbar.

## Application Layer

### Desktop Shell (`apps/desktop-shell`)

The main application that uses the OS component:

- **React + Vite**: Modern React application
- **OS Integration**: Uses `@browser-os/os` component
- **Entry Point**: Main entry point for the browser OS

## Data Flow

### Process Spawning

1. App requests process spawn via syscall
2. Kernel checks permissions
3. Process manager spawns process
4. App code loaded from filesystem
5. Process executes with sandboxed `os` API
6. Process can make syscalls (permission-checked)
7. Process communicates via IPC channel

### Window Creation

1. App creates window via window manager
2. Window registered with window manager
3. Window assigned to current workspace
4. Window rendered in workspace
5. Window events (focus, move, resize) handled by manager
6. Taskbar updated with window button

### Workspace Switching

1. User presses keyboard shortcut (Ctrl+1-9)
2. Workspace manager switches active workspace
3. Window manager filters windows by workspace
4. UI updates to show new workspace
5. Taskbar updates to show workspace windows

## Security Model

### Permission System

- **Default Deny**: Processes must have explicit permissions
- **Permission Checks**: Every syscall is permission-checked
- **Filesystem Access**: Restricted to allowed paths
- **Process Isolation**: Each process has its own security context

### Security Context

Each process has a security context that defines:
- Allowed syscalls
- Filesystem access paths
- Other permissions

The kernel enforces these permissions before executing syscalls.

## Package Dependencies

```
events (foundation)
  ↓
fs, kernel, proc, app-registry, schemas
  ↓
windowing, workspace, taskbar
  ↓
os (composes system components)
  ↓
desktop-shell (application)
```

## Type System

### Schemas (`@browser-os/schemas`)

All types are defined using Zod schemas for runtime validation:

- **Syscall schemas**: Request/response types
- **Process schemas**: Process metadata
- **Filesystem schemas**: File metadata, mount points
- **App schemas**: App manifests, registry entries
- **Event schemas**: Event types
- **Window schemas**: Window metadata
- **Workspace schemas**: Workspace metadata

This ensures type safety across the entire system.

## Future Architecture Considerations

- **App SDK**: SDK for building apps with standardized APIs
- **App Host**: Sandboxing system for app execution
- **Theme System**: Runtime theme switching
- **Mobile Mode**: Fullscreen app cards for mobile devices
- **System Apps**: Built-in apps (files, terminal, editor, etc.)

