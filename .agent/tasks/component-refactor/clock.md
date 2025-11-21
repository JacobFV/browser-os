# Clock Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the clock app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Time Display (`src/Clock.tsx`)
- **Current**: Custom time display styling
- **Refactor**: 
  - Use --text-primary for time display text
  - Use --glass-surface for display background (if applicable)
  - Ensure large time text is readable in both themes
  - Use theme variables for display container
- **Theme Support**: Adaptive time display styling
- **Files**: `Clock.tsx`, `Clock.css`

### 2. Date Display (`src/Clock.tsx`)
- **Current**: Custom date display styling
- **Refactor**: 
  - Use --text-secondary for date text
  - Use theme variables for date container
  - Ensure date is readable but less prominent than time
- **Theme Support**: Adaptive date display styling
- **Files**: `Clock.tsx`, `Clock.css`

### 3. Alarm Controls (`src/Clock.tsx`)
- **Current**: Custom alarm button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for set alarm button
  - Use --color-error for delete alarm button
  - Use theme variables for alarm list items
- **Theme Support**: Adaptive alarm control styling
- **Files**: `Clock.tsx`, `Clock.css`

### 4. Alarm List (`src/Clock.tsx`)
- **Current**: Custom alarm list styling
- **Refactor**: 
  - Use --glass-surface for alarm item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for active alarm
  - Use theme variables for alarm text
- **Theme Support**: Adaptive alarm list styling
- **Files**: `Clock.tsx`, `Clock.css`

### 5. Settings/Format Controls (`src/Clock.tsx`)
- **Current**: Custom settings buttons
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Replace toggles with `Toggle` component
  - Use theme variables for settings panel
- **Theme Support**: Adaptive settings styling
- **Files**: `Clock.tsx`, `Clock.css`

### 6. Timer/Stopwatch Controls (`src/Clock.tsx`)
- **Current**: Custom timer controls
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for start button
  - Use --color-error for stop button
  - Use --color-secondary for reset button
  - Use theme variables for timer display
- **Theme Support**: Adaptive timer control styling
- **Files**: `Clock.tsx`, `Clock.css`

## Main Component

### Clock (`src/Clock.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for clock app background
  - Use --glass-surface for UI panels
  - Ensure clock display is prominent
- **Files**: `Clock.tsx`, `Clock.css`

## Color Usage Guidelines

- **Time Display**: Use `--text-primary` for main time text
- **Date Display**: Use `--text-secondary` for date text
- **Primary Actions**: Use `--color-primary` for set alarm, start timer
- **Destructive Actions**: Use `--color-error` for delete alarm, stop timer
- **Secondary Actions**: Use `--color-secondary` for reset, secondary buttons
- **Active States**: Use `--color-primary-lighter` for active alarms
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

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

- **Time Display**: Should be large and prominent, easily readable
- **Date Display**: Should be readable but secondary to time
- **Alarm List**: Active alarms should be clearly visible
- **Timer Display**: Should be prominent and easy to read

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Toggle`, `Input` if needed)
3. Replace buttons with `Button` component
4. Replace toggles with `Toggle` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure time display uses theme text colors
7. Ensure alarm list uses theme variables
8. Test in both light and dark modes
9. Verify all controls are visible and functional

## Testing Checklist

- [ ] Time display is readable in both themes
- [ ] Date display is readable in both themes
- [ ] Alarm controls work correctly in both themes
- [ ] Alarm list is readable in both themes
- [ ] Active alarms are clearly visible in both themes
- [ ] Timer controls work correctly in both themes
- [ ] Settings panel is readable in both themes
- [ ] All buttons have proper hover/focus states
- [ ] Clock container is styled appropriately

