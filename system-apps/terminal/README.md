# Terminal App

Terminal emulator application for browser-os using xterm.js.

## Overview

The Terminal app provides a full terminal emulator with:
- xterm.js integration
- Shell command execution
- Process management
- Customizable appearance

## Features

- **Terminal Emulator**: Full xterm.js terminal
- **Shell Commands**: Execute shell commands
- **Process Integration**: Spawn processes via process manager
- **Customizable**: Themes and font settings

## Usage

Launch the Terminal app to open a shell session. The terminal supports:
- Standard shell commands (ls, cd, cat, etc.)
- Process spawning
- File system operations via VFS
- Environment variables

## Commands

### Built-in Commands

- `ls` - List directory contents
- `cd` - Change directory
- `cat` - Display file contents
- `echo` - Print text
- `ps` - List processes
- `pwd` - Print working directory

### Process Commands

- `spawn <app-id>` - Spawn an app process
- `kill <pid>` - Kill a process
- `ps` - List all processes

## Integration

The terminal integrates with:
- **@browser-os/fs**: File system operations
- **@browser-os/process**: Process management
- **@browser-os/windowing**: Window management

## Future Features

- Multiple tabs
- Split panes
- Custom shell scripts
- SSH support
- Terminal themes

