# Word Processor

A full-featured word processor application for browser-os with multiple document windows, rich text editing, and file operations.

## Features

- **Multiple Document Windows**: Each document opens in its own window
- **Rich Text Editing**: Format text with bold, italic, underline, fonts, sizes, and alignment
- **File Operations**: Save and load documents using system file dialogs
- **Keyboard Shortcuts**: Full keyboard support (Ctrl+S, Ctrl+O, Ctrl+N, etc.)
- **Status Bar**: Real-time word and character count
- **Menu Bar**: File, Edit, and Format menus
- **Toolbar**: Quick access to formatting tools

## Usage

### Opening the Word Processor

Click the "Word Processor" icon on the desktop, or use the app launcher.

### Creating a New Document

- Click "File" → "New" (or press Ctrl+N)
- Or click the "New Document" button on the welcome screen

### Opening a Document

- Click "File" → "Open..." (or press Ctrl+O)
- Browse to your document in the file dialog
- Select the file and click "Open"

### Saving a Document

- Click "File" → "Save" (or press Ctrl+S) to save to the current file
- Click "File" → "Save As..." (or press Ctrl+Shift+S) to save to a new file
- Choose a location and filename in the save dialog

### Formatting Text

- **Bold**: Select text and click the Bold button (B) or press Ctrl+B
- **Italic**: Select text and click the Italic button (I) or press Ctrl+I
- **Underline**: Select text and click the Underline button (U) or press Ctrl+U
- **Font Size**: Select text and choose a size from the dropdown
- **Font Family**: Select text and choose a font from the dropdown
- **Alignment**: Click alignment buttons (Left, Center, Right)

### Keyboard Shortcuts

- **Ctrl+N**: New document
- **Ctrl+O**: Open document
- **Ctrl+S**: Save document
- **Ctrl+Shift+S**: Save As
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+X**: Cut
- **Ctrl+C**: Copy
- **Ctrl+V**: Paste

## File Format

Documents are saved as HTML files in the virtual filesystem. The default save location is `vfs://documents/`.

## Multiple Windows

Each document opens in its own window. You can:
- Drag windows around the desktop
- Resize windows
- Minimize, maximize, and restore windows
- Switch between windows using Alt+Tab (when implemented)

## Status Bar

The status bar at the bottom shows:
- **Words**: Total word count (excluding HTML tags)
- **Characters**: Total character count (excluding HTML tags)

## Technical Details

- Built with React and TypeScript
- Uses `contentEditable` for rich text editing
- Integrates with browser-os filesystem (VFS)
- Uses system file dialogs from `@browser-os/dialogs`
- Window management via `@browser-os/windowing`

