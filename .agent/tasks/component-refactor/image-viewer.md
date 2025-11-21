# Image Viewer Component Refactor Plan

## Overview
Refactor the image viewer app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Image Display Area (`src/ImageViewer.tsx`)
- **Current**: Custom image container styling
- **Refactor**: 
  - Use theme variables for image container border
  - Use --glass-surface for image container background
  - Ensure image area is clearly defined in both themes
- **Theme Support**: Adaptive image container styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

### 2. Navigation Buttons (`src/ImageViewer.tsx`)
- **Current**: Custom prev/next buttons
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use theme variables for button styling
  - Use --color-primary for navigation actions
- **Theme Support**: Adaptive navigation button styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

### 3. Toolbar (`src/ImageViewer.tsx`)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for primary actions (Zoom, Fit)
  - Use --color-secondary for secondary actions
  - Use --glass-surface for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

### 4. Thumbnail Strip (`src/ImageViewer.tsx`)
- **Current**: Custom thumbnail styling
- **Refactor**: 
  - Use --glass-surface for thumbnail backgrounds
  - Use --glass-surface-hover for thumbnail hover states
  - Use --color-primary-lighter for selected thumbnail
  - Use theme variables for thumbnail border
- **Theme Support**: Adaptive thumbnail styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

### 5. Image Info Panel (`src/ImageViewer.tsx`)
- **Current**: Custom info panel styling
- **Refactor**: 
  - Use --glass-surface for info panel background
  - Use theme variables for info text
  - Ensure image metadata is readable in both themes
- **Theme Support**: Adaptive info panel styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

### 6. Zoom Controls (`src/ImageViewer.tsx`)
- **Current**: Custom zoom controls
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for zoom actions
  - Use theme variables for zoom indicator
- **Theme Support**: Adaptive zoom control styling
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

## Main Component

### ImageViewer (`src/ImageViewer.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure image viewing area is prominent
- **Files**: `ImageViewer.tsx`, `ImageViewer.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for zoom, navigation actions
- **Secondary Actions**: Use `--color-secondary` for secondary controls
- **Selected Thumbnail**: Use `--color-primary-lighter` for selected thumbnail
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants
- **Toolbar**: Use `--glass-surface` for toolbar background

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Image Display**: Should be clearly defined but not interfere with image viewing
- **Dark Background**: Consider dark background for image viewing area
- **Thumbnails**: Should be visible and clickable in both themes
- **Zoom Controls**: Should be accessible but not interfere with image

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`)
3. Replace buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure image container uses theme variables
6. Ensure toolbar uses theme variables
7. Test in both light and dark modes
8. Verify all controls work correctly

## Testing Checklist

- [ ] Image display area is styled appropriately in both themes
- [ ] Navigation buttons work correctly in both themes
- [ ] Toolbar is readable in both themes
- [ ] Thumbnail strip is readable in both themes
- [ ] Selected thumbnail is clearly visible in both themes
- [ ] Image info panel is readable in both themes
- [ ] Zoom controls work correctly in both themes
- [ ] Hover states work correctly in both themes

