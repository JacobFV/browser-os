# Draw Component Refactor Plan

## Overview
Refactor the draw app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Toolbar (`src/Toolbar.tsx`)
- **Current**: Custom toolbar button styling
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant for icon buttons)
  - Use --color-primary for selected tool
  - Use --glass-surface for toolbar background
  - Use theme variables for toolbar styling
- **Theme Support**: Adaptive toolbar styling
- **Files**: `Toolbar.tsx`, `Toolbar.css`

### 2. Menubar (`src/Menubar.tsx`)
- **Current**: Custom menu styling
- **Refactor**: 
  - Use --glass-surface for menubar background
  - Replace menu buttons with `Button` component
  - Use theme variables for menu items
  - Use --glass-surface-hover for menu item hover states
- **Theme Support**: Adaptive menubar styling
- **Files**: `Menubar.tsx`, `Menubar.css`

### 3. Color Picker (`src/Toolbar.tsx` or `src/Draw.tsx`)
- **Current**: Custom color picker styling
- **Refactor**: 
  - Use theme variables for color picker container
  - Use --glass-surface for color picker background
  - Ensure color swatches are visible in both themes
  - Use theme variables for color picker controls
- **Theme Support**: Adaptive color picker styling
- **Files**: `Toolbar.tsx`, `Draw.tsx`, `Draw.css`

### 4. Brush Size Selector (`src/Toolbar.tsx`)
- **Current**: Custom brush size controls
- **Refactor**: 
  - Replace with `Select` component if dropdown
  - Use theme variables for selector styling
  - Use --glass-surface for selector background
- **Theme Support**: Adaptive selector styling
- **Files**: `Toolbar.tsx`, `Toolbar.css`

### 5. Canvas Controls (`src/Draw.tsx`)
- **Current**: Custom canvas control buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for primary actions (Save, Export)
  - Use --color-secondary for secondary actions
  - Use --color-error for clear/delete actions
- **Theme Support**: Adaptive control button styling
- **Files**: `Draw.tsx`, `Draw.css`

### 6. Layer Panel (`src/Draw.tsx`)
- **Current**: Custom layer list styling
- **Refactor**: 
  - Use --glass-surface for layer panel background
  - Use --glass-surface-hover for layer item hover states
  - Use --color-primary-lighter for active layer
  - Use theme variables for layer text
- **Theme Support**: Adaptive layer panel styling
- **Files**: `Draw.tsx`, `Draw.css`

### 7. Properties Panel (`src/Draw.tsx`)
- **Current**: Custom properties panel styling
- **Refactor**: 
  - Use --glass-surface for properties panel background
  - Replace inputs with `Input` component
  - Replace selects with `Select` component
  - Use theme variables for panel styling
- **Theme Support**: Adaptive properties panel styling
- **Files**: `Draw.tsx`, `Draw.css`

## Main Component

### Draw (`src/Draw.tsx`)
- **Current**: Container component with canvas
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure canvas area is clearly defined
- **Files**: `Draw.tsx`, `Draw.css`

### KonvaCanvas (`src/KonvaCanvas.tsx`)
- **Current**: Canvas component
- **Refactor**: 
  - Use theme variables for canvas container border
  - Ensure canvas is clearly defined in both themes
- **Theme Support**: Adaptive canvas container styling
- **Files**: `KonvaCanvas.tsx`, `KonvaCanvas.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for save, export, selected tool
- **Secondary Actions**: Use `--color-secondary` for secondary tools
- **Destructive Actions**: Use `--color-error` for clear, delete actions
- **Active States**: Use `--color-primary-lighter` for active layer, selected tool
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants
- **Panels**: Use `--glass-surface` for toolbar, menubar, panels

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Canvas Area**: Should be clearly defined but not interfere with drawing
- **Tool Selection**: Selected tool should be clearly visible
- **Color Picker**: Color swatches should be visible in both themes
- **Layer Panel**: Active layer should be clearly indicated
- **Toolbar**: Should be accessible but not interfere with canvas

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Select`)
3. Replace toolbar buttons with `Button` component
4. Replace menubar buttons with `Button` component
5. Replace inputs/selects with UI components
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure panels use theme variables
8. Ensure canvas container uses theme variables
9. Test in both light and dark modes
10. Verify all tools and controls work correctly

## Testing Checklist

- [ ] Toolbar is readable in both themes
- [ ] Selected tool is clearly visible in both themes
- [ ] Menubar is readable in both themes
- [ ] Color picker is usable in both themes
- [ ] Brush size selector is readable in both themes
- [ ] Canvas controls work correctly in both themes
- [ ] Layer panel is readable in both themes
- [ ] Active layer is clearly visible in both themes
- [ ] Properties panel is readable in both themes
- [ ] Canvas container is styled appropriately
- [ ] All buttons have proper hover/focus states

