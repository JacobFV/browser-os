# @browser-os/clipboard

Clipboard management for Browser OS.

## Overview

The Clipboard Manager provides access to the system clipboard, allowing applications to read and write text and image data. It uses the native Clipboard API with fallbacks for older browsers.

## Usage

### Manager API

```typescript
import { ClipboardManager } from '@browser-os/clipboard';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const clipboardManager = new ClipboardManager({ eventBus });

// Read text from clipboard
const text = await clipboardManager.readText();

// Write text to clipboard
await clipboardManager.writeText('Hello, World!');

// Read clipboard data (any type)
const data = await clipboardManager.read();
// Returns: { type: 'text' | 'image', data: string | Uint8Array, mimeType?: string } | null

// Write clipboard data
await clipboardManager.write({
  type: 'text',
  data: 'Some text'
});

// Check clipboard content
const hasText = await clipboardManager.hasText();
const hasImage = await clipboardManager.hasImage();

// Clear clipboard
await clipboardManager.clear();
```

### Process API

Applications access clipboard functionality through the `os.clipboard` API:

```typescript
// Read/write text
const text = await os.clipboard.readText();
await os.clipboard.writeText('Hello, World!');

// Read/write arbitrary data
const data = await os.clipboard.read();
await os.clipboard.write({
  type: 'text',
  data: 'Some text'
});

// Check clipboard content
const hasText = await os.clipboard.hasText();
const hasImage = await os.clipboard.hasImage();

// Clear clipboard
await os.clipboard.clear();
```

## API Reference

### ClipboardManager

#### Constructor

```typescript
constructor(options?: ClipboardManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting clipboard events

#### Methods

##### `readText(): Promise<string>`

Read text from the clipboard.

**Returns:** Promise resolving to the clipboard text.

**Example:**
```typescript
const text = await clipboardManager.readText();
console.log('Clipboard text:', text);
```

##### `writeText(text: string): Promise<void>`

Write text to the clipboard.

**Parameters:**
- `text: string` - The text to write

**Example:**
```typescript
await clipboardManager.writeText('Hello, World!');
```

##### `read(): Promise<ClipboardData | null>`

Read clipboard data of any type (text or image).

**Returns:** Promise resolving to clipboard data or null if empty.

**Example:**
```typescript
const data = await clipboardManager.read();
if (data) {
  console.log('Type:', data.type);
  console.log('Data:', data.data);
}
```

##### `write(data: ClipboardData): Promise<void>`

Write clipboard data of any type.

**Parameters:**
- `data: ClipboardData` - The clipboard data to write
  - `type: 'text' | 'image'` - Data type
  - `data: string | Uint8Array` - The data
  - `mimeType?: string` - MIME type (for images)

**Example:**
```typescript
// Write text
await clipboardManager.write({
  type: 'text',
  data: 'Hello'
});

// Write image
await clipboardManager.write({
  type: 'image',
  data: imageBytes,
  mimeType: 'image/png'
});
```

##### `clear(): Promise<void>`

Clear the clipboard by writing an empty string.

**Example:**
```typescript
await clipboardManager.clear();
```

##### `hasText(): Promise<boolean>`

Check if the clipboard contains text.

**Returns:** Promise resolving to true if clipboard has text.

**Example:**
```typescript
const hasText = await clipboardManager.hasText();
```

##### `hasImage(): Promise<boolean>`

Check if the clipboard contains an image.

**Returns:** Promise resolving to true if clipboard has image.

**Example:**
```typescript
const hasImage = await clipboardManager.hasImage();
```

## Types

### ClipboardData

```typescript
interface ClipboardData {
  type: 'text' | 'image' | 'file';
  data: string | Uint8Array;
  mimeType?: string;
}
```

## Browser Compatibility

- **Clipboard API**: Modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+)
- **Fallback**: Uses `document.execCommand` for older browsers
- **Image Support**: Requires Clipboard API (not available in fallback)

## Events

The ClipboardManager emits the following events via the event bus:

- `clipboard:changed` - Emitted when clipboard content changes

## Syscalls

The following syscalls are registered when ClipboardManager is provided to the Kernel:

- `clipboard.readText()` - Read text from clipboard
- `clipboard.writeText(text)` - Write text to clipboard
- `clipboard.read()` - Read clipboard data (any type)
- `clipboard.write(data)` - Write clipboard data (any type)
- `clipboard.clear()` - Clear clipboard
- `clipboard.hasText()` - Check if clipboard has text
- `clipboard.hasImage()` - Check if clipboard has image

