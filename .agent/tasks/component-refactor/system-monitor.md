# System Monitor Component Refactor Plan

## Overview
Refactor the system monitor app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Metric Cards (`src/SystemMonitor.tsx`)
- **Current**: Custom metric card styling
- **Refactor**: 
  - Use --glass-surface for card backgrounds
  - Use theme variables for card borders/shadows
  - Use --color-primary for primary metrics
  - Use --color-secondary for secondary metrics
  - Ensure metrics are readable in both themes
- **Theme Support**: Adaptive metric card styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

### 2. Charts (`src/SystemMonitor.tsx`)
- **Current**: Custom chart styling
- **Refactor**: 
  - Use theme variables for chart backgrounds
  - Use --color-primary, --color-secondary for chart lines/bars
  - Use --color-success, --color-warning, --color-error for status indicators
  - Ensure charts are readable in both themes
- **Theme Support**: Adaptive chart styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

### 3. Refresh Button (`src/SystemMonitor.tsx`)
- **Current**: Custom refresh button styling
- **Refactor**: 
  - Replace with `Button` component (ghost variant)
  - Use --color-secondary for refresh button
  - Use theme variables for button states
- **Theme Support**: Adaptive refresh button styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

### 4. Time Range Selector (`src/SystemMonitor.tsx`)
- **Current**: Custom time range selector
- **Refactor**: 
  - Replace with `Select` component if dropdown
  - Use theme variables for selector styling
  - Use --glass-surface for selector background
- **Theme Support**: Adaptive selector styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

### 5. Status Indicators (`src/SystemMonitor.tsx`)
- **Current**: Custom status indicator styling
- **Refactor**: 
  - Use --color-success for healthy status
  - Use --color-warning for warning status
  - Use --color-error for error status
  - Use theme variables for indicator backgrounds
- **Theme Support**: Adaptive status indicator styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

### 6. Process List (`src/SystemMonitor.tsx`)
- **Current**: Custom process list styling
- **Refactor**: 
  - Use --glass-surface for process item backgrounds
  - Use --glass-surface-hover for hover states
  - Use theme variables for process text
- **Theme Support**: Adaptive process list styling
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

## Main Component

### SystemMonitor (`src/SystemMonitor.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure metrics and charts are clearly displayed
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

## Color Usage Guidelines

- **Primary Metrics**: Use `--color-primary` for CPU, Memory
- **Secondary Metrics**: Use `--color-secondary` for Network, Disk
- **Status Indicators**: 
  - Healthy: `--color-success`
  - Warning: `--color-warning`
  - Error: `--color-error`
- **Charts**: Use theme color variables for chart data visualization
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-success`, `--color-warning`, `--color-error`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Charts**: Should be clearly readable in both themes
- **Metrics**: Should be easy to scan and understand
- **Status Indicators**: Should be clearly visible and color-coded
- **Real-time Updates**: UI should remain readable during updates

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Select`)
3. Replace buttons with `Button` component
4. Replace selects with `Select` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure charts use theme color variables
7. Ensure metric cards use theme variables
8. Test in both light and dark modes
9. Verify all metrics and charts are readable

## Testing Checklist

- [ ] Metric cards are readable in both themes
- [ ] Charts are readable in both themes
- [ ] Chart colors are visible in both themes
- [ ] Status indicators are visible in both themes
- [ ] Refresh button works correctly in both themes
- [ ] Time range selector works correctly in both themes
- [ ] Process list is readable in both themes
- [ ] Hover states work correctly in both themes
- [ ] All metrics are clearly displayed

