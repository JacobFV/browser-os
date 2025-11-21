# Browser Component Refactor Plan

## Overview
Refactor the browser app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Address Bar (`src/Browser.tsx`)
- **Current**: Custom input field for URL entry
- **Refactor**: 
  - Replace input with `Input` component
  - Use theme variables for address bar background
  - Use --glass-surface for address bar container
  - Use --color-primary for navigation actions
- **Theme Support**: Adaptive address bar styling
- **Files**: `Browser.tsx`, `Browser.css`

### 2. Navigation Buttons (`src/Browser.tsx`)
- **Current**: Custom buttons for back, forward, reload, home
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant for icon buttons)
  - Use theme variables for button states
  - Use --color-primary for active navigation state
- **Theme Support**: Adaptive button styling
- **Files**: `Browser.tsx`, `Browser.css`

### 3. Tabs (if implemented)
- **Current**: Custom tab styling
- **Refactor**: 
  - Use --glass-surface for tab backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for active tab
  - Use theme variables for tab borders
- **Theme Support**: Adaptive tab styling
- **Files**: `Browser.tsx`, `Browser.css`

### 4. Bookmarks Bar (if implemented)
- **Current**: Custom bookmark styling
- **Refactor**: 
  - Use theme variables for bookmark items
  - Use --glass-surface-hover for hover states
  - Replace buttons with `Button` component
- **Theme Support**: Adaptive bookmark styling
- **Files**: `Browser.tsx`, `Browser.css`

### 5. Error Messages (`src/Browser.tsx`)
- **Current**: Custom error display
- **Refactor**: 
  - Use --color-error for error messages
  - Use theme variables for error container background
  - Ensure error text is readable in both themes
- **Theme Support**: Adaptive error styling
- **Files**: `Browser.tsx`, `Browser.css`

### 6. Loading Indicator (`src/Browser.tsx`)
- **Current**: Custom loading state
- **Refactor**: 
  - Use --color-primary for loading indicator
  - Use theme variables for loading background
- **Theme Support**: Adaptive loading styling
- **Files**: `Browser.tsx`, `Browser.css`

## Main Component

### Browser (`src/Browser.tsx`)
- **Current**: Container component with iframe
- **Refactor**: 
  - Ensure toolbar uses theme variables
  - Use --glass-surface for toolbar background
  - Use theme variables for iframe container border
- **Files**: `Browser.tsx`, `Browser.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for navigation buttons, go button
- **Secondary Actions**: Use `--color-secondary` for secondary buttons
- **Error States**: Use `--color-error` for connection errors, invalid URLs
- **Loading States**: Use `--color-primary` for loading indicators
- **Active States**: Use `--color-primary-lighter` for active tab/button
- **Hover States**: Use `--glass-surface-hover`

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace address bar input with `Input` component
4. Replace navigation buttons with `Button` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure iframe container uses theme-aware borders
7. Test in both light and dark modes
8. Ensure all interactive elements have proper hover/focus states

## Testing Checklist

- [ ] Address bar is readable in both themes
- [ ] Navigation buttons work correctly in both themes
- [ ] Error messages are visible in both themes
- [ ] Loading indicator is visible in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Iframe container is styled appropriately in both themes
- [ ] All buttons have proper hover/focus states

