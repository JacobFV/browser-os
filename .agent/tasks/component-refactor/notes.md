# Notes Component Refactor Plan

## Overview
Refactor the notes app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Note List (`src/Notes.tsx`)
- **Current**: Custom note list item styling
- **Refactor**: 
  - Use --glass-surface for note item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected note
  - Use theme variables for note text
- **Theme Support**: Adaptive note list styling
- **Files**: `Notes.tsx`, `Notes.css`

### 2. Note Editor (`src/Notes.tsx`)
- **Current**: Custom editor textarea styling
- **Refactor**: 
  - Use theme variables for editor background
  - Use --text-primary for editor text
  - Use --glass-surface for editor container
  - Ensure editor is readable in both themes
- **Theme Support**: Adaptive editor styling
- **Files**: `Notes.tsx`, `Notes.css`

### 3. Create Note Button (`src/Notes.tsx`)
- **Current**: Custom create button styling
- **Refactor**: 
  - Replace with `Button` component (primary variant)
  - Use --color-primary for create button
  - Make create button prominent
- **Theme Support**: Adaptive create button styling
- **Files**: `Notes.tsx`, `Notes.css`

### 4. Note Actions (`src/Notes.tsx`)
- **Current**: Custom action buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for save action
  - Use --color-error for delete action
  - Use --color-secondary for secondary actions
- **Theme Support**: Adaptive action button styling
- **Files**: `Notes.tsx`, `Notes.css`

### 5. Search Bar (`src/Notes.tsx`)
- **Current**: Custom search input
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for search bar styling
  - Use --glass-surface for search bar background
- **Theme Support**: Adaptive search bar styling
- **Files**: `Notes.tsx`, `Notes.css`

### 6. Note Tags/Categories (`src/Notes.tsx`)
- **Current**: Custom tag styling
- **Refactor**: 
  - Use --color-secondary-lighter for tag backgrounds
  - Use theme variables for tag text
  - Ensure tags are visible in both themes
- **Theme Support**: Adaptive tag styling
- **Files**: `Notes.tsx`, `Notes.css`

## Main Component

### Notes (`src/Notes.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure note list and editor are clearly separated
- **Files**: `Notes.tsx`, `Notes.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for create, save actions
- **Destructive Actions**: Use `--color-error` for delete action
- **Secondary Actions**: Use `--color-secondary` for secondary actions
- **Selected Note**: Use `--color-primary-lighter` for selected note background
- **Tags**: Use `--color-secondary-lighter` for tag backgrounds
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`, `--color-secondary-lighter`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace buttons with `Button` component
4. Replace search input with `Input` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure note list uses theme variables
7. Ensure editor uses theme variables
8. Test in both light and dark modes

## Testing Checklist

- [ ] Note list is readable in both themes
- [ ] Selected note is clearly visible in both themes
- [ ] Note editor is readable in both themes
- [ ] Create button is prominent in both themes
- [ ] Note actions work correctly in both themes
- [ ] Search bar is readable in both themes
- [ ] Tags are visible in both themes
- [ ] Hover states work correctly in both themes

