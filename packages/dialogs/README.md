# @browser-os/dialogs

System file dialogs for browser-os applications.

## Installation

```bash
pnpm add @browser-os/dialogs
```

## Features

- **Open Dialog**: Browse and select files from the virtual filesystem
- **Save Dialog**: Choose location and filename for saving files
- **File Filtering**: Filter files by extension
- **Directory Navigation**: Navigate through VFS mount points
- **Win95 Style**: Classic Windows 95 dialog appearance

## Usage

```typescript
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import { useState } from 'react';

function MyApp() {
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = (result: FileDialogResult) => {
    if (!result.canceled && result.filePaths.length > 0) {
      console.log('Selected file:', result.filePaths[0]);
    }
    setShowDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Open File</button>
      <FileDialog
        open={showDialog}
        mode="open"
        title="Open File"
        filters={[
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ]}
        defaultPath="vfs://documents/"
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
```

## API

### FileDialog Props

- `open: boolean` - Whether the dialog is visible
- `mode: 'open' | 'save'` - Dialog mode
- `title?: string` - Dialog title
- `filters?: FileFilter[]` - File type filters
- `defaultPath?: string` - Initial directory path
- `allowMultiple?: boolean` - Allow multiple file selection (open mode only)
- `onClose: () => void` - Called when dialog is closed
- `onConfirm: (result: FileDialogResult) => void` - Called when user confirms

### FileDialogResult

```typescript
interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
}
```

### FileFilter

```typescript
interface FileFilter {
  name: string;
  extensions: string[];
}
```

## Examples

### Save Dialog

```typescript
<FileDialog
  open={showSaveDialog}
  mode="save"
  title="Save Document"
  filters={[
    { name: 'Text Files', extensions: ['txt'] },
  ]}
  defaultPath="vfs://documents/"
  onClose={() => setShowSaveDialog(false)}
  onConfirm={(result) => {
    if (!result.canceled) {
      await saveFile(result.filePaths[0]);
    }
  }}
/>
```

### Open Multiple Files

```typescript
<FileDialog
  open={showOpenDialog}
  mode="open"
  allowMultiple={true}
  filters={[{ name: 'Images', extensions: ['png', 'jpg', 'gif'] }]}
  onConfirm={(result) => {
    result.filePaths.forEach(path => {
      loadFile(path);
    });
  }}
/>
```

