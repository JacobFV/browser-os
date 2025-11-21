# Camera Component Refactor Plan

## Overview
Refactor the camera app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Camera Preview (`src/Camera.tsx`)
- **Current**: Custom video preview styling
- **Refactor**: 
  - Use theme variables for preview container border
  - Use --glass-surface for preview container background
  - Ensure preview area is clearly defined in both themes
- **Theme Support**: Adaptive preview container styling
- **Files**: `Camera.tsx`, `Camera.css`

### 2. Capture Button (`src/Camera.tsx`)
- **Current**: Custom capture button styling
- **Refactor**: 
  - Replace with `Button` component (primary variant, large size)
  - Use --color-primary for capture button
  - Use --color-primary-shaded for hover state
  - Make capture button prominent and circular
- **Theme Support**: Adaptive capture button styling
- **Files**: `Camera.tsx`, `Camera.css`

### 3. Control Buttons (`src/Camera.tsx`)
- **Current**: Custom buttons for settings, flip, etc.
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use theme variables for button states
  - Use --color-secondary for secondary controls
- **Theme Support**: Adaptive control button styling
- **Files**: `Camera.tsx`, `Camera.css`

### 4. Settings Panel (`src/Camera.tsx`)
- **Current**: Custom settings UI
- **Refactor**: 
  - Use --glass-surface for settings panel background
  - Replace inputs with `Input` component
  - Replace selects with `Select` component
  - Use theme variables for panel styling
- **Theme Support**: Adaptive settings panel styling
- **Files**: `Camera.tsx`, `Camera.css`

### 5. Photo Gallery/Preview (`src/Camera.tsx`)
- **Current**: Custom gallery styling
- **Refactor**: 
  - Use theme variables for gallery items
  - Use --glass-surface-hover for item hover states
  - Use --color-primary-lighter for selected photo
- **Theme Support**: Adaptive gallery styling
- **Files**: `Camera.tsx`, `Camera.css`

### 6. Error Messages (`src/Camera.tsx`)
- **Current**: Custom error display
- **Refactor**: 
  - Use --color-error for error messages
  - Use theme variables for error container
  - Ensure error text is readable in both themes
- **Theme Support**: Adaptive error styling
- **Files**: `Camera.tsx`, `Camera.css`

## Main Component

### Camera (`src/Camera.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for camera app background
  - Use --glass-surface for UI panels
  - Ensure camera controls are visible in both themes
- **Files**: `Camera.tsx`, `Camera.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for capture button
- **Secondary Actions**: Use `--color-secondary` for control buttons
- **Error States**: Use `--color-error` for camera errors, permission denied
- **Success States**: Use `--color-success` for successful capture
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants
- **Selected States**: Use `--color-primary-lighter` for selected items

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-error`, `--color-success`
- `--radius-sm`, `--radius-md`, `--radius-lg` (for circular capture button)
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Camera Preview**: Video preview area should be clearly defined but not interfere with preview
- **Capture Button**: Should be large, circular, and prominent
- **Controls**: Should be visible but not interfere with camera preview
- **Permissions**: Error messages for camera permissions should be clear

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Select`)
3. Replace capture button with `Button` component (primary, large)
4. Replace control buttons with `Button` component
5. Replace settings inputs with `Input`/`Select` components
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure camera preview container uses theme variables
8. Test in both light and dark modes
9. Ensure all controls are visible in both themes

## Testing Checklist

- [ ] Camera preview container is styled appropriately in both themes
- [ ] Capture button is prominent and visible in both themes
- [ ] Control buttons work correctly in both themes
- [ ] Settings panel is readable in both themes
- [ ] Error messages are visible in both themes
- [ ] Photo gallery is readable in both themes
- [ ] Hover states work correctly in both themes
- [ ] All buttons have proper focus states

