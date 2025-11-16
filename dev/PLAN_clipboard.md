# Clipboard API Implementation Plan

## Overview
Add a clipboard API that allows application processes to read from and write to the system clipboard. This provides access to text, images, and other clipboard data.

## Architecture

### 1. Clipboard Syscalls (`packages/kernel/src/syscalls/clipboard.ts`)
Create clipboard syscall handlers:
- `clipboard.readText()` - Read text from clipboard, returns string
- `clipboard.writeText(text)` - Write text to clipboard, returns void
- `clipboard.read()` - Read clipboard data (any type), returns ClipboardData
- `clipboard.write(data)` - Write clipboard data (any type), returns void
- `clipboard.clear()` - Clear clipboard, returns void
- `clipboard.hasText()` - Check if clipboard has text, returns boolean
- `clipboard.hasImage()` - Check if clipboard has image, returns boolean

### 2. Clipboard Manager
- Create a `ClipboardManager` class that wraps browser Clipboard API
- Handle both text and image data
- Provide fallback for browsers without Clipboard API
- Store clipboard state in memory (or IndexedDB for persistence)

### 3. Clipboard API Class (`packages/proc/src/ClipboardAPI.ts`)
Create a `ClipboardAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `readText()`, `writeText()`, `read()`, `write()`, `clear()`, `hasText()`, `hasImage()`
- Handles different clipboard formats (text, image, files)

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `clipboard: ClipboardAPI`
- Modify `ProcessManager.spawn()` to create a `ClipboardAPI` instance and add it to `osApi`

## Implementation Details

### Clipboard Data Types
```typescript
interface ClipboardData {
  type: 'text' | 'image' | 'file';
  data: string | Uint8Array | FileInfo;
  mimeType?: string; // For images/files
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  data: Uint8Array;
}
```

### Usage Example
```javascript
// In app code
// Read text
const text = await os.clipboard.readText();
console.log('Clipboard text:', text);

// Write text
await os.clipboard.writeText('Hello, World!');

// Check if clipboard has text
if (await os.clipboard.hasText()) {
  const content = await os.clipboard.readText();
}

// Read any clipboard data
const data = await os.clipboard.read();
if (data.type === 'text') {
  console.log('Text:', data.data);
} else if (data.type === 'image') {
  console.log('Image:', data.data, data.mimeType);
}

// Write image
await os.clipboard.write({
  type: 'image',
  data: imageBytes,
  mimeType: 'image/png'
});

// Clear clipboard
await os.clipboard.clear();
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/clipboard.ts` - Clipboard syscall handlers
2. `packages/proc/src/ClipboardAPI.ts` - Clipboard API class
3. `packages/clipboard/src/ClipboardManager.ts` - Clipboard manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add ClipboardManager dependency, register syscalls
2. `packages/kernel/package.json` - Add clipboard package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create ClipboardAPI instance
5. `packages/proc/src/index.ts` - Export ClipboardAPI

## Considerations

- **Browser Clipboard API**: Use modern Clipboard API (`navigator.clipboard`) when available
- **Fallback**: For browsers without Clipboard API, use:
  - `document.execCommand('copy')` / `document.execCommand('paste')` (deprecated but widely supported)
  - Create temporary textarea/input elements for text operations
  
- **Permissions**: Browser Clipboard API requires:
  - Secure context (HTTPS or localhost)
  - User activation (user gesture) for write operations
  - Permissions API for read operations
  
- **Image Support**: 
  - Convert images to/from Blob/Uint8Array
  - Handle different image formats (PNG, JPEG, etc.)
  - May need canvas API for image manipulation
  
- **File Support**:
  - Handle file objects
  - Convert files to/from Uint8Array
  - Store file metadata (name, type, size)
  
- **Security**: 
  - Clipboard access is sensitive - consider permission checks
  - Validate clipboard data before writing
  - Limit data size to prevent DoS
  
- **Cross-Origin**: Clipboard API has cross-origin restrictions - ensure proper handling

## Security

- Require user gesture for write operations (browser requirement)
- Validate clipboard data size and format
- Consider permission system for clipboard access
- Sanitize clipboard data to prevent XSS if displaying

## Implementation Strategy

1. Create ClipboardManager that wraps browser Clipboard API
2. Provide fallback for older browsers
3. Handle async clipboard operations properly
4. Support text, images, and files
5. Integrate with permission system if needed

