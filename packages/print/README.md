# @browser-os/print

Print management for Browser OS.

## Overview

The Print Manager provides printing functionality, allowing applications to print HTML content, the current window, or content from a URL. It uses the native browser printing capabilities.

## Usage

### Manager API

```typescript
import { PrintManager } from '@browser-os/print';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const printManager = new PrintManager({ eventBus });

// Print HTML content
await printManager.printHTML('<h1>Hello</h1><p>World</p>', {
  silent: false,
  printBackground: true
});

// Print current window
await printManager.printWindow();

// Print URL
await printManager.printURL('https://example.com/page.html');
```

### Process API

Applications access print functionality through the `os.print` API:

```typescript
// Print HTML content
await os.print.printHTML('<h1>Hello</h1><p>World</p>', {
  silent: false,
  printBackground: true
});

// Print current window
await os.print.printWindow();

// Print URL
await os.print.printURL('https://example.com/page.html');
```

## API Reference

### PrintManager

#### Constructor

```typescript
constructor(options?: PrintManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting print events

#### Methods

##### `printHTML(html: string, options?: PrintOptions): Promise<void>`

Print content from an HTML string.

**Parameters:**
- `html: string` - HTML content to print
- `options?: PrintOptions` - Print options
  - `silent?: boolean` - Suppress print dialog (default: false)
  - `printBackground?: boolean` - Print background colors/images
  - `margin?: { top?, bottom?, left?, right? }` - Page margins
  - `scale?: number` - Scale factor
  - `pageRanges?: Array<{ from: number, to: number }>` - Page ranges to print
  - `headerFooter?: boolean` - Show header/footer

**Example:**
```typescript
await printManager.printHTML(`
  <html>
    <head><title>My Document</title></head>
    <body>
      <h1>Hello World</h1>
      <p>This is a test document.</p>
    </body>
  </html>
`, {
  printBackground: true,
  margin: { top: '1in', bottom: '1in' }
});
```

##### `printWindow(options?: PrintOptions): Promise<void>`

Print the current window's content.

**Parameters:**
- `options?: PrintOptions` - Print options

**Example:**
```typescript
await printManager.printWindow({
  printBackground: true
});
```

##### `printURL(url: string, options?: PrintOptions): Promise<void>`

Print content from a URL by opening it in a new window and printing.

**Parameters:**
- `url: string` - URL to print
- `options?: PrintOptions` - Print options

**Example:**
```typescript
await printManager.printURL('https://example.com/document.html', {
  silent: false
});
```

## Types

### PrintOptions

```typescript
interface PrintOptions {
  silent?: boolean; // Suppress print dialog
  printBackground?: boolean; // Print background colors/images
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  scale?: number; // Scale factor
  pageRanges?: Array<{ from: number; to: number }>; // Page ranges
  headerFooter?: boolean; // Show header/footer
}
```

## Browser Compatibility

- **window.print()**: All modern browsers
- **Print Dialog**: Browser-dependent (Chrome, Firefox, Safari, Edge all support)
- **Print Options**: Limited browser support for advanced options
- **Note**: Some print options may not be supported in all browsers

## Events

The PrintManager emits the following events via the event bus:

- `print:beforePrint` - Emitted before printing starts
- `print:afterPrint` - Emitted after printing completes

**Example event listener:**
```typescript
eventBus.on('print:beforePrint', (data) => {
  console.log('Printing started');
});

eventBus.on('print:afterPrint', (data) => {
  console.log('Printing completed');
});
```

## Syscalls

The following syscalls are registered when PrintManager is provided to the Kernel:

- `print.html(html, options?)` - Print HTML content
- `print.window(options?)` - Print current window
- `print.url(url, options?)` - Print URL content

## Notes

- Print dialogs are browser-controlled and may vary between browsers
- Some print options may not be honored by all browsers
- For best results, use well-formed HTML with print-friendly CSS
- Consider using `@media print` CSS rules for print-specific styling
- Pop-up blockers may interfere with print windows

