# Dialogs API Implementation Plan

## Overview
Add a dialogs API that allows application processes to show system dialogs (alert, confirm, prompt) and file picker dialogs. This requires creating a dialog system that can be invoked from processes and return results asynchronously.

## Architecture

### 1. Dialog Syscalls (`packages/kernel/src/syscalls/dialog.ts`)
Create dialog syscall handlers:
- `dialog.alert(message, options?)` - Show alert dialog, returns void
- `dialog.confirm(message, options?)` - Show confirm dialog, returns boolean
- `dialog.prompt(message, defaultValue?, options?)` - Show prompt dialog, returns string | null
- `dialog.openFile(options)` - Show file open dialog, returns FileInfo[] | null
- `dialog.saveFile(options)` - Show file save dialog, returns FileInfo | null
- `dialog.selectDirectory(options)` - Show directory picker, returns string | null

### 2. Dialog Manager Integration
- The dialogs package already exists with Dialog components
- Need to create a DialogManager that can show dialogs programmatically
- Dialogs need to be shown in a way that blocks the process until user responds
- Use a promise-based approach where syscall waits for dialog result

### 3. Dialog API Class (`packages/proc/src/DialogAPI.ts`)
Create a `DialogAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `alert()`, `confirm()`, `prompt()`, `openFile()`, `saveFile()`, `selectDirectory()`
- All methods return Promises that resolve when user interacts with dialog

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `dialog: DialogAPI`
- Modify `ProcessManager.spawn()` to create a `DialogAPI` instance and add it to `osApi`

## Implementation Details

### Dialog Options
```typescript
interface AlertOptions {
  title?: string;
  icon?: 'info' | 'warning' | 'error' | 'success';
}

interface ConfirmOptions extends AlertOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

interface PromptOptions extends AlertOptions {
  placeholder?: string;
  inputType?: 'text' | 'password' | 'number';
  confirmLabel?: string;
  cancelLabel?: string;
}

interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  multiple?: boolean; // For openFile
  createDirectory?: boolean; // For saveFile
}

interface DirectoryDialogOptions {
  title?: string;
  defaultPath?: string;
}
```

### FileInfo Object
```typescript
interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  lastModified: number;
}
```

### Usage Example
```javascript
// In app code
// Alert
await os.dialog.alert('Operation completed successfully!', {
  title: 'Success',
  icon: 'success'
});

// Confirm
const confirmed = await os.dialog.confirm('Are you sure you want to delete this file?', {
  title: 'Confirm Delete',
  icon: 'warning',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
});

if (confirmed) {
  // Delete file
}

// Prompt
const filename = await os.dialog.prompt('Enter filename:', 'untitled.txt', {
  title: 'Save File',
  placeholder: 'Enter filename...'
});

if (filename) {
  // Use filename
}

// Open File
const files = await os.dialog.openFile({
  title: 'Select Files',
  multiple: true,
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    { name: 'All Files', extensions: ['*'] }
  ]
});

if (files) {
  files.forEach(file => {
    console.log(`Selected: ${file.path}`);
  });
}

// Save File
const file = await os.dialog.saveFile({
  title: 'Save As',
  defaultPath: '/home/user/Documents',
  filters: [
    { name: 'Text Files', extensions: ['txt'] },
    { name: 'All Files', extensions: ['*'] }
  ]
});

if (file) {
  // Save to file.path
}

// Select Directory
const directory = await os.dialog.selectDirectory({
  title: 'Select Directory',
  defaultPath: '/home/user'
});

if (directory) {
  console.log(`Selected directory: ${directory}`);
}
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/dialog.ts` - Dialog syscall handlers
2. `packages/proc/src/DialogAPI.ts` - Dialog API class
3. `packages/dialogs/src/DialogManager.ts` - Dialog manager for programmatic dialog display (if doesn't exist)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add DialogManager dependency, register syscalls
2. `packages/kernel/package.json` - Add `@browser-os/dialogs` dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create DialogAPI instance
5. `packages/proc/src/index.ts` - Export DialogAPI
6. `packages/dialogs/src/index.ts` - Export DialogManager if needed

## Considerations

- **Blocking Behavior**: Dialogs need to block the process until user responds. This requires:
  - A way to show dialogs from syscalls
  - A way to wait for dialog result before returning from syscall
  - Dialog results need to be communicated back to the process
  
- **Dialog Rendering**: Dialogs need to be rendered in the OS layer, not in the process sandbox. Options:
  - Use EventBus to request dialog display
  - DialogManager shows dialog and waits for result
  - Result is sent back via EventBus or callback
  
- **Window Association**: Dialogs should be associated with the process's window (if any) for proper focus/positioning

- **File System Integration**: File dialogs need to interact with FileSystem to:
  - List directories/files
  - Navigate directory tree
  - Validate file selections
  - Create directories if needed

- **Async Handling**: Since dialogs are async, syscalls need to properly wait for results. Consider using a promise-based approach with a result registry.

## Security

- Validate dialog inputs (message length, etc.)
- File dialogs should respect filesystem permissions
- Prevent path traversal attacks in file dialogs
- Limit file dialog to accessible directories based on process permissions

## Implementation Strategy

1. Create DialogManager that can show dialogs programmatically
2. Use EventBus for dialog requests/responses with unique IDs
3. Syscall creates dialog request, waits for response event
4. DialogManager shows dialog, emits response event with result
5. Syscall receives response and returns to process

