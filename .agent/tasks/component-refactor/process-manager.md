# Process Manager Component Refactor Plan

## Overview
Refactor the process manager app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Process List (`src/ProcessManager.tsx`)
- **Current**: Custom process table/list styling
- **Refactor**: 
  - Use --glass-surface for process row backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected process
  - Use theme variables for process text
- **Theme Support**: Adaptive process list styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

### 2. Process Table Headers (`src/ProcessManager.tsx`)
- **Current**: Custom table header styling
- **Refactor**: 
  - Use --glass-surface for header backgrounds
  - Use --text-primary for header text
  - Use theme variables for header borders
- **Theme Support**: Adaptive table header styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

### 3. Action Buttons (`src/ProcessManager.tsx`)
- **Current**: Custom action button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-error for kill/terminate buttons
  - Use --color-secondary for refresh button
  - Use --color-primary for primary actions
- **Theme Support**: Adaptive action button styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

### 4. Process Status Indicators (`src/ProcessManager.tsx`)
- **Current**: Custom status indicator styling
- **Refactor**: 
  - Use --color-success for running processes
  - Use --color-error for terminated processes
  - Use --color-warning for suspended processes
  - Use theme variables for status indicators
- **Theme Support**: Adaptive status indicator styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

### 5. Filter/Search (`src/ProcessManager.tsx`)
- **Current**: Custom filter/search input
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for filter styling
  - Use --glass-surface for filter background
- **Theme Support**: Adaptive filter styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

### 6. Process Details Panel (`src/ProcessManager.tsx`)
- **Current**: Custom details panel styling
- **Refactor**: 
  - Use --glass-surface for details panel background
  - Use theme variables for details text
  - Ensure process details are readable in both themes
- **Theme Support**: Adaptive details panel styling
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

## Main Component

### ProcessManager (`src/ProcessManager.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure process table is clear and readable
- **Files**: `ProcessManager.tsx`, `ProcessManager.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for primary actions
- **Destructive Actions**: Use `--color-error` for kill/terminate buttons
- **Secondary Actions**: Use `--color-secondary` for refresh, secondary buttons
- **Status Indicators**: 
  - Running: `--color-success`
  - Terminated: `--color-error`
  - Suspended: `--color-warning`
- **Selected Process**: Use `--color-primary-lighter` for selected process
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-success`, `--color-warning`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Process Table**: Should be clear and easy to scan
- **Status Indicators**: Should be clearly visible and understandable
- **Kill Button**: Should be clearly destructive but accessible
- **Process Details**: Should be readable and well-organized

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace buttons with `Button` component
4. Replace filter input with `Input` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure process table uses theme variables
7. Ensure status indicators use theme color variables
8. Test in both light and dark modes
9. Verify all actions work correctly

## Testing Checklist

- [ ] Process list is readable in both themes
- [ ] Table headers are readable in both themes
- [ ] Selected process is clearly visible in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Status indicators are visible in both themes
- [ ] Filter/search is readable in both themes
- [ ] Process details panel is readable in both themes
- [ ] Hover states work correctly in both themes
- [ ] Kill button is clearly destructive in both themes

