# Terminal Component Refactor Plan

## Overview
Refactor the terminal app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Terminal Output (`src/Terminal.tsx`)
- **Current**: Custom terminal output styling (xterm.js)
- **Refactor**: 
  - Configure xterm.js theme to use CSS variables
  - Use theme variables for terminal background
  - Use theme variables for terminal text colors
  - Ensure terminal is readable in both themes
- **Theme Support**: Adaptive terminal output styling
- **Files**: `Terminal.tsx`, `Terminal.css`

### 2. Terminal Settings (`src/Terminal.tsx`)
- **Current**: Custom settings panel styling
- **Refactor**: 
  - Use --glass-surface for settings panel background
  - Replace inputs with `Input` component
  - Replace selects with `Select` component
  - Replace toggles with `Toggle` component
  - Use theme variables for settings panel
- **Theme Support**: Adaptive settings panel styling
- **Files**: `Terminal.tsx`, `Terminal.css`

### 3. Terminal Tabs (`src/Terminal.tsx`)
- **Current**: Custom tab styling
- **Refactor**: 
  - Use --glass-surface for tab backgrounds
  - Use --glass-surface-hover for tab hover states
  - Use --color-primary-lighter for active tab
  - Use theme variables for tab borders
- **Theme Support**: Adaptive tab styling
- **Files**: `Terminal.tsx`, `Terminal.css`

### 4. Terminal Controls (`src/Terminal.tsx`)
- **Current**: Custom control buttons
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use theme variables for control buttons
  - Use --color-secondary for secondary controls
- **Theme Support**: Adaptive control button styling
- **Files**: `Terminal.tsx`, `Terminal.css`

### 5. Command History (`src/Terminal.tsx`)
- **Current**: Custom history display
- **Refactor**: 
  - Use theme variables for history panel background
  - Use --glass-surface for history items
  - Use theme variables for history text
- **Theme Support**: Adaptive history styling
- **Files**: `Terminal.tsx`, `Terminal.css`

## Main Component

### Terminal (`src/Terminal.tsx`)
- **Current**: Container component with xterm.js
- **Refactor**: 
  - Use theme variables for terminal container
  - Use --glass-surface for UI panels
  - Ensure terminal area is prominent
- **Files**: `Terminal.tsx`, `Terminal.css`

## Color Usage Guidelines

- **Terminal Background**: Use dark background for terminal area
- **Terminal Text**: Use appropriate text colors for readability
- **Primary Actions**: Use `--color-primary` for primary actions
- **Secondary Actions**: Use `--color-secondary` for secondary controls
- **Active Tab**: Use `--color-primary-lighter` for active tab
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

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

- **xterm.js Integration**: Need to configure xterm.js theme based on current theme
- **Terminal Colors**: Should maintain terminal color scheme while using theme variables
- **Readability**: Terminal output must be clearly readable in both themes
- **Settings**: Terminal settings should be easy to configure

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Select`, `Toggle`)
3. Replace buttons with `Button` component
4. Replace inputs/selects/toggles with UI components
5. Configure xterm.js theme to adapt to current theme
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure terminal container uses theme variables
8. Ensure settings panel uses theme variables
9. Test in both light and dark modes
10. Verify terminal output is readable in both themes

## Testing Checklist

- [ ] Terminal output is readable in both themes
- [ ] Terminal colors work correctly in both themes
- [ ] Terminal settings panel is readable in both themes
- [ ] Terminal tabs work correctly in both themes
- [ ] Active tab is clearly visible in both themes
- [ ] Terminal controls work correctly in both themes
- [ ] Command history is readable in both themes
- [ ] Hover states work correctly in both themes
- [ ] xterm.js theme adapts to current theme

