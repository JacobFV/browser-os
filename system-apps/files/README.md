# Files App

File manager application for browser-os.

## Overview

The Files app provides a complete file management interface with:
- File and folder navigation
- Mount point management
- File preview
- Copy, move, rename, delete operations
- Drag and drop support

## Features

- **File Browser**: Navigate files and folders
- **Mount Points**: View and manage mounted filesystems
- **File Preview**: Preview images, text files, and more
- **Operations**: Copy, move, rename, delete files
- **Drag & Drop**: Drag files between locations

## Usage

Launch the Files app from the desktop or app launcher. The app opens in a window showing:
- Sidebar with mount points and favorites
- Main area with file/folder grid or list view
- Toolbar with common operations

## File Operations

### Copy/Move

1. Select files
2. Right-click → Copy or Cut
3. Navigate to destination
4. Right-click → Paste

### Rename

1. Right-click file → Rename
2. Enter new name
3. Press Enter

### Delete

1. Select files
2. Press Delete or right-click → Delete
3. Confirm deletion

## Mount Points

View mounted filesystems in the sidebar:
- `/home` - User home directory (IndexedDB)
- `/data` - App data (IndexedDB)
- `/temp` - Temporary files (Memory)

## Keyboard Shortcuts

- **Ctrl+N**: New folder
- **Ctrl+C**: Copy
- **Ctrl+V**: Paste
- **Ctrl+X**: Cut
- **Delete**: Delete selected
- **F2**: Rename
- **F5**: Refresh

## Future Features

- File search
- File properties dialog
- Multiple tabs
- File compression
- File sharing

