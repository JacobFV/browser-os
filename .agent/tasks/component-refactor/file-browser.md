# File Browser Component Refactor Plan

## Overview
Refactor the file browser app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Toolbar (`src/Toolbar.tsx`)
- **Current**: Custom buttons, view mode toggles
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use `Toggle` component for view mode switches if applicable
  - Use --color-primary for primary actions
  - Use theme variables for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `Toolbar.tsx`, `Toolbar.css`

### 2. FileList (`src/FileList.tsx`)
- **Current**: Custom file list items, selection states
- **Refactor**: 
  - Use theme variables for list item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected items
  - Ensure file icons are visible in both themes
- **Theme Support**: Adaptive list item colors and selection states
- **Files**: `FileList.tsx`, `FileList.css` (if exists)

### 3. ContextMenu (`src/ContextMenu.tsx`)
- **Current**: Custom context menu styling
- **Refactor**: 
  - Use --glass-surface for menu background
  - Use theme variables for menu items
  - Use --glass-surface-hover for hover states
  - Replace any buttons with `Button` component
- **Theme Support**: Adaptive context menu styling
- **Files**: `ContextMenu.tsx`, `ContextMenu.css` (if exists)

### 4. RenameDialog (`src/RenameDialog.tsx`)
- **Current**: Custom dialog with input
- **Refactor**: 
  - Replace input with `Input` component
  - Replace buttons with `Button` component
  - Use --glass-surface for dialog background
  - Use theme variables for dialog styling
- **Theme Support**: Adaptive dialog styling
- **Files**: `RenameDialog.tsx`, `RenameDialog.css` (if exists)

### 5. DeleteConfirmDialog (`src/DeleteConfirmDialog.tsx`)
- **Current**: Custom confirmation dialog
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-error for delete button
  - Use --color-secondary for cancel button
  - Use --glass-surface for dialog background
- **Theme Support**: Adaptive dialog styling
- **Files**: `DeleteConfirmDialog.tsx`, `DeleteConfirmDialog.css` (if exists)

### 6. NewFolderDialog (`src/NewFolderDialog.tsx`)
- **Current**: Custom dialog with input
- **Refactor**: 
  - Replace input with `Input` component
  - Replace buttons with `Button` component
  - Use --glass-surface for dialog background
  - Use theme variables for dialog styling
- **Theme Support**: Adaptive dialog styling
- **Files**: `NewFolderDialog.tsx`, `NewFolderDialog.css` (if exists)

## Main Component

### FileBrowser (`src/FileBrowser.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Ensure error messages use theme-aware styling
  - Use theme variables for loading states
  - Use theme variables for breadcrumb navigation
- **Files**: `FileBrowser.tsx`, `FileBrowser.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (Create folder, etc.)
- **Destructive Actions**: Use `--color-error` (Delete, Remove)
- **Secondary Actions**: Use `--color-secondary` (Cancel, Secondary buttons)
- **Selection**: Use `--color-primary-lighter` for selected items
- **Hover States**: Use `--glass-surface-hover`
- **Active States**: Use `--glass-surface-active`

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components in each file
3. Replace custom buttons with `Button` component
4. Replace custom inputs with `Input` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure file icons are visible in both themes
7. Ensure selection states are clear in both themes
8. Test in both light and dark modes
9. Ensure all dialogs are readable in both themes

## Testing Checklist

- [ ] All buttons work correctly in light mode
- [ ] All buttons work correctly in dark mode
- [ ] File list items are readable in both themes
- [ ] Selected items are clearly visible in both themes
- [ ] Context menu is readable in both themes
- [ ] Dialogs are readable in both themes
- [ ] Input fields are readable in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Error messages are visible in both themes
- [ ] File icons are visible in both themes

