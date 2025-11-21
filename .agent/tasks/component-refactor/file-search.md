# File Search Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the file search app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Search Input (`src/FileSearch.tsx`)
- **Current**: Custom search input styling
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for search input styling
  - Use --glass-surface for search bar background
  - Ensure search input is prominent
- **Theme Support**: Adaptive search input styling
- **Files**: `FileSearch.tsx`, `FileSearch.css`

### 2. Search Results List (`src/FileSearch.tsx`)
- **Current**: Custom result list item styling
- **Refactor**: 
  - Use --glass-surface for result item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected result
  - Use theme variables for result text
- **Theme Support**: Adaptive result list styling
- **Files**: `FileSearch.tsx`, `FileSearch.css`

### 3. Filter Controls (`src/FileSearch.tsx`)
- **Current**: Custom filter buttons/controls
- **Refactor**: 
  - Replace buttons with `Button` component
  - Replace selects with `Select` component
  - Use --color-secondary for filter controls
  - Use theme variables for filter panel
- **Theme Support**: Adaptive filter styling
- **Files**: `FileSearch.tsx`, `FileSearch.css`

### 4. Result Actions (`src/FileSearch.tsx`)
- **Current**: Custom action buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for open action
  - Use --color-secondary for secondary actions
  - Use theme variables for action buttons
- **Theme Support**: Adaptive action button styling
- **Files**: `FileSearch.tsx`, `FileSearch.css`

### 5. Empty State (`src/FileSearch.tsx`)
- **Current**: Custom empty state styling
- **Refactor**: 
  - Use --text-secondary for empty state text
  - Use theme variables for empty state container
  - Ensure empty state is readable in both themes
- **Theme Support**: Adaptive empty state styling
- **Files**: `FileSearch.tsx`, `FileSearch.css`

## Main Component

### FileSearch (`src/FileSearch.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure search interface is clear
- **Files**: `FileSearch.tsx`, `FileSearch.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for search, open actions
- **Secondary Actions**: Use `--color-secondary` for filter controls
- **Selected Result**: Use `--color-primary-lighter` for selected result background
- **Hover States**: Use `--glass-surface-hover`
- **Empty State**: Use `--text-secondary` for empty state text

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Select`)
3. Replace search input with `Input` component
4. Replace buttons with `Button` component
5. Replace selects with `Select` component
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure result list uses theme variables
8. Test in both light and dark modes

## Testing Checklist

- [ ] Search input is readable in both themes
- [ ] Search results are readable in both themes
- [ ] Selected result is clearly visible in both themes
- [ ] Filter controls work correctly in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Empty state is readable in both themes
- [ ] Hover states work correctly in both themes

