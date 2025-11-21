# Screenshot Component Refactor Plan

## Overview
Refactor the screenshot app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Screenshot Preview (`src/Screenshot.tsx`)
- **Current**: Custom screenshot display styling
- **Refactor**: 
  - Use theme variables for preview container border
  - Use --glass-surface for preview container background
  - Ensure screenshot is clearly displayed in both themes
- **Theme Support**: Adaptive preview container styling
- **Files**: `Screenshot.tsx`, `Screenshot.css`

### 2. Capture Controls (`src/Screenshot.tsx`)
- **Current**: Custom capture button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for capture button
  - Use --color-secondary for cancel button
  - Make capture button prominent
- **Theme Support**: Adaptive control button styling
- **Files**: `Screenshot.tsx`, `Screenshot.css`

### 3. Toolbar (`src/Screenshot.tsx`)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for save, copy actions
  - Use --color-secondary for edit actions
  - Use --glass-surface for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `Screenshot.tsx`, `Screenshot.css`

### 4. Annotation Tools (`src/Screenshot.tsx`)
- **Current**: Custom annotation tool buttons
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use --color-primary for selected tool
  - Use theme variables for tool panel
- **Theme Support**: Adaptive annotation tool styling
- **Files**: `Screenshot.tsx`, `Screenshot.css`

### 5. Color Picker (`src/Screenshot.tsx`)
- **Current**: Custom color picker styling
- **Refactor**: 
  - Use theme variables for color picker container
  - Use --glass-surface for color picker background
  - Ensure color swatches are visible in both themes
- **Theme Support**: Adaptive color picker styling
- **Files**: `Screenshot.tsx`, `Screenshot.css`

## Main Component

### Screenshot (`src/Screenshot.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure screenshot area is prominent
- **Files**: `Screenshot.tsx`, `Screenshot.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for capture, save, copy actions
- **Secondary Actions**: Use `--color-secondary` for edit, cancel actions
- **Selected Tool**: Use `--color-primary` for selected annotation tool
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

- **Screenshot Display**: Should be clearly visible in both themes
- **Annotation Tools**: Should be accessible but not interfere with screenshot
- **Color Picker**: Color swatches should be visible in both themes

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`)
3. Replace buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure screenshot container uses theme variables
6. Ensure toolbar uses theme variables
7. Test in both light and dark modes
8. Verify all controls work correctly

## Testing Checklist

- [ ] Screenshot preview is clearly visible in both themes
- [ ] Capture controls work correctly in both themes
- [ ] Toolbar is readable in both themes
- [ ] Annotation tools work correctly in both themes
- [ ] Selected tool is clearly visible in both themes
- [ ] Color picker is usable in both themes
- [ ] Hover states work correctly in both themes

