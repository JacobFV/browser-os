# Calculator Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the calculator app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Display Area (`src/Calculator.tsx`)
- **Current**: Custom display styling
- **Refactor**: 
  - Use --glass-surface for display background
  - Use --text-primary for display text
  - Use theme variables for display border
  - Ensure large numbers are readable in both themes
- **Theme Support**: Adaptive display styling
- **Files**: `Calculator.tsx`, `Calculator.css`

### 2. Number Buttons (`src/Calculator.tsx`)
- **Current**: Custom button styling for numbers 0-9
- **Refactor**: 
  - Use --glass-surface for button backgrounds
  - Use --glass-surface-hover for hover states
  - Use --glass-surface-active for active/pressed states
  - Use theme variables for button text
- **Theme Support**: Adaptive button styling
- **Files**: `Calculator.tsx`, `Calculator.css`

### 3. Operation Buttons (`src/Calculator.tsx`)
- **Current**: Custom styling for +, -, ×, ÷
- **Refactor**: 
  - Use --color-secondary for operation buttons
  - Use --color-secondary-shaded for hover states
  - Use --color-secondary-dark for active states
  - Ensure operations are visually distinct from numbers
- **Theme Support**: Adaptive operation button styling
- **Files**: `Calculator.tsx`, `Calculator.css`

### 4. Equals Button (`src/Calculator.tsx`)
- **Current**: Custom styling for = button
- **Refactor**: 
  - Use --color-primary for equals button
  - Use --color-primary-shaded for hover state
  - Use --color-primary-dark for active state
  - Make equals button visually prominent
- **Theme Support**: Adaptive equals button styling
- **Files**: `Calculator.tsx`, `Calculator.css`

### 5. Function Buttons (`src/Calculator.tsx`)
- **Current**: Custom styling for Clear, Percentage, etc.
- **Refactor**: 
  - Use --color-accent for function buttons (Clear, etc.)
  - Use --color-accent-shaded for hover states
  - Use theme variables for button text
- **Theme Support**: Adaptive function button styling
- **Files**: `Calculator.tsx`, `Calculator.css`

### 6. Equation Display (`src/Calculator.tsx`)
- **Current**: Custom styling for equation history
- **Refactor**: 
  - Use --text-secondary for equation text
  - Use theme variables for equation background
  - Ensure equation is readable but less prominent than display
- **Theme Support**: Adaptive equation display styling
- **Files**: `Calculator.tsx`, `Calculator.css`

## Main Component

### Calculator (`src/Calculator.tsx`)
- **Current**: Container component with button grid
- **Refactor**: 
  - Use --glass-surface for calculator background
  - Use theme variables for calculator border/shadow
  - Ensure calculator container is visually distinct
- **Files**: `Calculator.tsx`, `Calculator.css`

## Color Usage Guidelines

- **Display**: Use `--glass-surface` background, `--text-primary` for text
- **Number Buttons**: Use `--glass-surface` with hover states
- **Operation Buttons**: Use `--color-secondary` to distinguish from numbers
- **Equals Button**: Use `--color-primary` for prominence
- **Function Buttons**: Use `--color-accent` for special functions
- **Hover States**: Use `-shaded` variants
- **Active/Pressed States**: Use `-dark` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-dark`
- `--color-secondary`, `--color-secondary-shaded`, `--color-secondary-dark`
- `--color-accent`, `--color-accent-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Button Grid**: Maintain calculator button grid layout while using theme variables
- **Visual Hierarchy**: Ensure equals button is most prominent, operations are distinct from numbers
- **Touch Targets**: Maintain adequate button sizes for usability
- **Pressed States**: Ensure active/pressed button states are visible in both themes

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Update CSS to use theme variables instead of hardcoded colors
3. Replace button styling with theme-aware classes
4. Ensure display area uses theme variables
5. Test button states (hover, active, pressed) in both themes
6. Ensure all text is readable in both themes
7. Test in both light and dark modes
8. Verify visual hierarchy is maintained

## Testing Checklist

- [ ] Display area is readable in both themes
- [ ] Number buttons are visible and clickable in both themes
- [ ] Operation buttons are visually distinct in both themes
- [ ] Equals button is prominent in both themes
- [ ] Function buttons are visible in both themes
- [ ] Hover states work correctly in both themes
- [ ] Active/pressed states are visible in both themes
- [ ] Button grid layout is maintained
- [ ] Calculator container is styled appropriately

