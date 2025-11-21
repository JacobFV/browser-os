# Calendar Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the calendar app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Calendar Grid (`src/Calendar.tsx`)
- **Current**: Custom calendar cell styling
- **Refactor**: 
  - Use --glass-surface for calendar cell backgrounds
  - Use --glass-surface-hover for cell hover states
  - Use --glass-border-subtle for cell borders
  - Ensure calendar grid is readable in both themes
- **Theme Support**: Adaptive calendar cell styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 2. Today Indicator (`src/Calendar.tsx`)
- **Current**: Custom styling for today's date
- **Refactor**: 
  - Use --color-primary for today's date highlight
  - Use --color-primary-lighter for today's background
  - Ensure today indicator is clear in both themes
- **Theme Support**: Adaptive today indicator styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 3. Selected Date (`src/Calendar.tsx`)
- **Current**: Custom styling for selected date
- **Refactor**: 
  - Use --color-primary-shaded for selected date background
  - Use --text-light for selected date text
  - Ensure selection is clear in both themes
- **Theme Support**: Adaptive selection styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 4. Event Items (`src/Calendar.tsx`)
- **Current**: Custom event styling
- **Refactor**: 
  - Use --color-primary-lighter for event backgrounds
  - Use --color-secondary-lighter for different event types
  - Use theme variables for event text
  - Ensure events are visible in both themes
- **Theme Support**: Adaptive event styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 5. Navigation Buttons (`src/Calendar.tsx`)
- **Current**: Custom buttons for month/year navigation
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant)
  - Use --color-primary for navigation actions
  - Use theme variables for button states
- **Theme Support**: Adaptive navigation button styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 6. Month/Year Selector (`src/Calendar.tsx`)
- **Current**: Custom selectors for month and year
- **Refactor**: 
  - Replace with `Select` component if dropdowns exist
  - Use theme variables for selector styling
  - Ensure selectors are readable in both themes
- **Theme Support**: Adaptive selector styling
- **Files**: `Calendar.tsx`, `Calendar.css`

### 7. Weekday Headers (`src/Calendar.tsx`)
- **Current**: Custom styling for weekday labels
- **Refactor**: 
  - Use --text-secondary for weekday headers
  - Use theme variables for header background
  - Ensure headers are readable in both themes
- **Theme Support**: Adaptive header styling
- **Files**: `Calendar.tsx`, `Calendar.css`

## Main Component

### Calendar (`src/Calendar.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use --glass-surface for calendar container background
  - Use theme variables for container border/shadow
  - Ensure calendar is visually distinct
- **Files**: `Calendar.tsx`, `Calendar.css`

## Color Usage Guidelines

- **Today**: Use `--color-primary` for today's date highlight
- **Selected Date**: Use `--color-primary-shaded` for selected date background
- **Events**: Use `--color-primary-lighter` or `--color-secondary-lighter` for event backgrounds
- **Navigation**: Use `--color-primary` for navigation buttons
- **Hover States**: Use `--glass-surface-hover` for cell hover
- **Borders**: Use `--glass-border-subtle` for cell borders

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-lighter`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Calendar Grid**: Maintain clear grid structure while using theme variables
- **Date Visibility**: Ensure dates are clearly readable in both themes
- **Event Visibility**: Ensure events stand out but don't overwhelm the calendar
- **Today Indicator**: Must be clearly visible in both themes
- **Selection State**: Selected date must be clearly distinguishable

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Select` if needed)
3. Replace navigation buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure calendar cells use theme variables
6. Ensure today indicator uses primary color
7. Ensure selected date uses primary color variant
8. Test in both light and dark modes
9. Verify all states (hover, selected, today) are visible

## Testing Checklist

- [ ] Calendar grid is readable in both themes
- [ ] Today indicator is visible in both themes
- [ ] Selected date is clearly visible in both themes
- [ ] Events are visible in both themes
- [ ] Navigation buttons work correctly in both themes
- [ ] Cell hover states work in both themes
- [ ] Weekday headers are readable in both themes
- [ ] Month/year selectors are readable in both themes
- [ ] Calendar container is styled appropriately

