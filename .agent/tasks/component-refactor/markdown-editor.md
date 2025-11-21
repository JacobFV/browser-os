# Markdown Editor Component Refactor Plan

## Overview
Refactor the markdown editor app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Editor Pane (`src/MarkdownEditor.tsx`)
- **Current**: Custom editor textarea styling
- **Refactor**: 
  - Use theme variables for editor background
  - Use --text-primary for editor text
  - Use --glass-surface for editor container
  - Ensure editor is readable in both themes
- **Theme Support**: Adaptive editor styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

### 2. Preview Pane (`src/MarkdownEditor.tsx`)
- **Current**: Custom preview styling
- **Refactor**: 
  - Use theme variables for preview background
  - Use --text-primary for preview text
  - Use --glass-surface for preview container
  - Ensure markdown rendering is readable in both themes
- **Theme Support**: Adaptive preview styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

### 3. Toolbar (`src/MarkdownEditor.tsx`)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant for icon buttons)
  - Use --color-primary for primary formatting actions
  - Use --color-secondary for secondary actions
  - Use --glass-surface for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

### 4. File Actions (`src/MarkdownEditor.tsx`)
- **Current**: Custom file action buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for save, open actions
  - Use --color-secondary for secondary actions
  - Use theme variables for file menu
- **Theme Support**: Adaptive file action styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

### 5. Split View Toggle (`src/MarkdownEditor.tsx`)
- **Current**: Custom toggle button
- **Refactor**: 
  - Replace with `Toggle` component
  - Use theme variables for toggle styling
  - Ensure toggle state is clear in both themes
- **Theme Support**: Adaptive toggle styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

### 6. Line Numbers (`src/MarkdownEditor.tsx`)
- **Current**: Custom line number styling
- **Refactor**: 
  - Use --text-secondary for line numbers
  - Use theme variables for line number background
  - Ensure line numbers are readable but not distracting
- **Theme Support**: Adaptive line number styling
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

## Main Component

### MarkdownEditor (`src/MarkdownEditor.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure editor and preview are clearly separated
- **Files**: `MarkdownEditor.tsx`, `MarkdownEditor.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for save, primary formatting
- **Secondary Actions**: Use `--color-secondary` for secondary formatting
- **Editor Text**: Use `--text-primary` for editor content
- **Preview Text**: Use `--text-primary` for preview content
- **Line Numbers**: Use `--text-secondary` for line numbers
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Editor**: Should have good contrast for code editing
- **Preview**: Should render markdown clearly in both themes
- **Syntax Highlighting**: If implemented, ensure colors work in both themes
- **Split View**: Should clearly show editor/preview separation

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Toggle`)
3. Replace buttons with `Button` component
4. Replace toggle with `Toggle` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure editor uses theme variables
7. Ensure preview uses theme variables
8. Test in both light and dark modes
9. Verify markdown rendering is readable in both themes

## Testing Checklist

- [ ] Editor pane is readable in both themes
- [ ] Preview pane is readable in both themes
- [ ] Toolbar is readable in both themes
- [ ] File actions work correctly in both themes
- [ ] Split view toggle works correctly in both themes
- [ ] Line numbers are readable in both themes
- [ ] Markdown rendering is clear in both themes
- [ ] Hover states work correctly in both themes
- [ ] Editor and preview are clearly separated

