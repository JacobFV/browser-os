# Games Component Refactor Plan

## Overview
Refactor the games app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Game List (`src/Games.tsx`)
- **Current**: Custom game list item styling
- **Refactor**: 
  - Use --glass-surface for game item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected game
  - Use theme variables for game text
- **Theme Support**: Adaptive game list styling
- **Files**: `Games.tsx`, `Games.css`

### 2. Game Cards (`src/Games.tsx`)
- **Current**: Custom game card styling
- **Refactor**: 
  - Use --glass-surface for card backgrounds
  - Use theme variables for card borders/shadows
  - Use --glass-surface-hover for card hover states
  - Ensure game thumbnails are visible
- **Theme Support**: Adaptive game card styling
- **Files**: `Games.tsx`, `Games.css`

### 3. Play Button (`src/Games.tsx`)
- **Current**: Custom play button styling
- **Refactor**: 
  - Replace with `Button` component (primary variant)
  - Use --color-primary for play button
  - Use --color-primary-shaded for hover state
  - Make play button prominent
- **Theme Support**: Adaptive play button styling
- **Files**: `Games.tsx`, `Games.css`

### 4. Game Controls (`src/Games.tsx`)
- **Current**: Custom control buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-secondary for secondary controls
  - Use --color-error for quit/exit button
  - Use theme variables for control panel
- **Theme Support**: Adaptive control button styling
- **Files**: `Games.tsx`, `Games.css`

### 5. Category Filter (`src/Games.tsx`)
- **Current**: Custom category selector
- **Refactor**: 
  - Replace with `Select` component if dropdown
  - Use theme variables for category styling
  - Use --color-secondary for category buttons
- **Theme Support**: Adaptive category styling
- **Files**: `Games.tsx`, `Games.css`

## Main Component

### Games (`src/Games.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure game interface is clear
- **Files**: `Games.tsx`, `Games.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for play button
- **Secondary Actions**: Use `--color-secondary` for category filters
- **Destructive Actions**: Use `--color-error` for quit/exit
- **Selected Game**: Use `--color-primary-lighter` for selected game
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Select`)
3. Replace buttons with `Button` component
4. Replace selects with `Select` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure game list uses theme variables
7. Test in both light and dark modes

## Testing Checklist

- [ ] Game list is readable in both themes
- [ ] Game cards are visible in both themes
- [ ] Play button is prominent in both themes
- [ ] Game controls work correctly in both themes
- [ ] Category filter works correctly in both themes
- [ ] Hover states work correctly in both themes
- [ ] Selected game is clearly visible in both themes

