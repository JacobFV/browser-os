# PDF Viewer Component Refactor Plan

## Overview
Refactor the PDF viewer app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. PDF Display Area (`src/PDFViewer.tsx`)
- **Current**: Custom PDF container styling
- **Refactor**: 
  - Use theme variables for PDF container border
  - Use --glass-surface for PDF container background
  - Ensure PDF area is clearly defined in both themes
- **Theme Support**: Adaptive PDF container styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

### 2. Navigation Buttons (`src/PDFViewer.tsx`)
- **Current**: Custom prev/next page buttons
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use theme variables for button styling
  - Use --color-primary for navigation actions
- **Theme Support**: Adaptive navigation button styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

### 3. Toolbar (`src/PDFViewer.tsx`)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for primary actions (Zoom, Fit)
  - Use --color-secondary for secondary actions
  - Use --glass-surface for toolbar background
- **Theme Support**: Adaptive toolbar styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

### 4. Page Controls (`src/PDFViewer.tsx`)
- **Current**: Custom page number input
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for page control styling
  - Use --glass-surface for page control background
- **Theme Support**: Adaptive page control styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

### 5. Thumbnail Panel (`src/PDFViewer.tsx`)
- **Current**: Custom thumbnail styling
- **Refactor**: 
  - Use --glass-surface for thumbnail panel background
  - Use --glass-surface-hover for thumbnail hover states
  - Use --color-primary-lighter for current page thumbnail
  - Use theme variables for thumbnail border
- **Theme Support**: Adaptive thumbnail styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

### 6. Zoom Controls (`src/PDFViewer.tsx`)
- **Current**: Custom zoom controls
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for zoom actions
  - Use theme variables for zoom indicator
- **Theme Support**: Adaptive zoom control styling
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

## Main Component

### PDFViewer (`src/PDFViewer.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure PDF viewing area is prominent
- **Files**: `PDFViewer.tsx`, `PDFViewer.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for zoom, navigation actions
- **Secondary Actions**: Use `--color-secondary` for secondary controls
- **Current Page**: Use `--color-primary-lighter` for current page thumbnail
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

- **PDF Display**: Should be clearly defined but not interfere with PDF viewing
- **Dark Background**: Consider dark background for PDF viewing area
- **Thumbnails**: Should be visible and clickable in both themes
- **Zoom Controls**: Should be accessible but not interfere with PDF

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace buttons with `Button` component
4. Replace page input with `Input` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure PDF container uses theme variables
7. Ensure toolbar uses theme variables
8. Test in both light and dark modes
9. Verify all controls work correctly

## Testing Checklist

- [ ] PDF display area is styled appropriately in both themes
- [ ] Navigation buttons work correctly in both themes
- [ ] Toolbar is readable in both themes
- [ ] Page controls work correctly in both themes
- [ ] Thumbnail panel is readable in both themes
- [ ] Current page thumbnail is clearly visible in both themes
- [ ] Zoom controls work correctly in both themes
- [ ] Hover states work correctly in both themes

