# Notepad Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the notepad app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Text Editor (`src/Notepad.tsx`)
- **Current**: Custom textarea styling
- **Refactor**: 
  - Use theme variables for editor background
  - Use --text-primary for editor text
  - Use --glass-surface for editor container
  - Ensure editor is readable in both themes
- **Theme Support**: Adaptive editor styling
- **Files**: `Notepad.tsx`, `Notepad.css`

### 2. Toolbar (`src/Notepad.tsx` or separate component)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for save, open actions
  - Use --color-secondary for formatting actions
  - Use --glass-surface for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `Notepad.tsx`, `Notepad.css`

### 3. File Menu (`src/Notepad.tsx`)
- **Current**: Custom file menu styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use theme variables for menu items
  - Use --glass-surface for menu background
  - Use --glass-surface-hover for menu item hover states
- **Theme Support**: Adaptive menu styling
- **Files**: `Notepad.tsx`, `Notepad.css`

### 4. Status Bar (`src/Notepad.tsx`)
- **Current**: Custom status bar styling
- **Refactor**: 
  - Use --text-secondary for status text
  - Use theme variables for status bar background
  - Ensure status info is readable in both themes
- **Theme Support**: Adaptive status bar styling
- **Files**: `Notepad.tsx`, `Notepad.css`

### 5. Word Count (`src/Notepad.tsx`)
- **Current**: Custom word count display
- **Refactor**: 
  - Use --text-secondary for word count text
  - Use theme variables for word count container
  - Ensure word count is readable in both themes
- **Theme Support**: Adaptive word count styling
- **Files**: `Notepad.tsx`, `Notepad.css`

## Main Component

### Notepad (`src/Notepad.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure editor area is prominent
- **Files**: `Notepad.tsx`, `Notepad.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for save, open actions
- **Secondary Actions**: Use `--color-secondary` for formatting actions
- **Editor Text**: Use `--text-primary` for editor content
- **Status Text**: Use `--text-secondary` for status information
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

- **Editor**: Should have good contrast for text editing
- **Text Selection**: Ensure selected text is visible in both themes
- **Line Wrapping**: If implemented, ensure it's clear in both themes

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`)
3. Replace buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure editor uses theme variables
6. Ensure toolbar uses theme variables
7. Test in both light and dark modes
8. Verify text editing is comfortable in both themes

## Testing Checklist

- [ ] Text editor is readable in both themes
- [ ] Toolbar is readable in both themes
- [ ] File menu is readable in both themes
- [ ] Status bar is readable in both themes
- [ ] Word count is readable in both themes
- [ ] Text selection is visible in both themes
- [ ] Hover states work correctly in both themes
- [ ] Editor area is prominent and clear

