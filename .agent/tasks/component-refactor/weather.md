# Weather Component Refactor Plan

## Overview
Refactor the weather app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Current Weather Display (`src/Weather.tsx`)
- **Current**: Custom weather display styling
- **Refactor**: 
  - Use --glass-surface for weather card background
  - Use theme variables for weather text
  - Use --text-primary for temperature
  - Use --text-secondary for conditions
  - Ensure weather info is readable in both themes
- **Theme Support**: Adaptive weather display styling
- **Files**: `Weather.tsx`, `Weather.css`

### 2. Location Input (`src/Weather.tsx`)
- **Current**: Custom location input styling
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for input styling
  - Use --glass-surface for input background
- **Theme Support**: Adaptive input styling
- **Files**: `Weather.tsx`, `Weather.css`

### 3. Forecast Cards (`src/Weather.tsx`)
- **Current**: Custom forecast card styling
- **Refactor**: 
  - Use --glass-surface for forecast card backgrounds
  - Use theme variables for card borders/shadows
  - Use --color-primary-lighter for today's forecast
  - Ensure forecast cards are readable in both themes
- **Theme Support**: Adaptive forecast card styling
- **Files**: `Weather.tsx`, `Weather.css`

### 4. Refresh Button (`src/Weather.tsx`)
- **Current**: Custom refresh button styling
- **Refactor**: 
  - Replace with `Button` component (ghost variant)
  - Use --color-secondary for refresh button
  - Use theme variables for button states
- **Theme Support**: Adaptive refresh button styling
- **Files**: `Weather.tsx`, `Weather.css`

### 5. Weather Icons (`src/Weather.tsx`)
- **Current**: Custom weather icon styling
- **Refactor**: 
  - Use theme variables for icon colors
  - Ensure icons are visible in both themes
  - Use --color-primary for primary weather icons
- **Theme Support**: Adaptive icon styling
- **Files**: `Weather.tsx`, `Weather.css`

### 6. Error Messages (`src/Weather.tsx`)
- **Current**: Custom error display
- **Refactor**: 
  - Use --color-error for error messages
  - Use theme variables for error container
  - Ensure error text is readable in both themes
- **Theme Support**: Adaptive error styling
- **Files**: `Weather.tsx`, `Weather.css`

## Main Component

### Weather (`src/Weather.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure weather information is clearly displayed
- **Files**: `Weather.tsx`, `Weather.css`

## Color Usage Guidelines

- **Primary Display**: Use `--text-primary` for temperature, main info
- **Secondary Display**: Use `--text-secondary` for conditions, details
- **Today's Forecast**: Use `--color-primary-lighter` for today's forecast card
- **Weather Icons**: Use `--color-primary` for primary weather icons
- **Error States**: Use `--color-error` for error messages
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

## Special Considerations

- **Weather Icons**: Should be clearly visible in both themes
- **Temperature Display**: Should be large and prominent
- **Forecast Cards**: Should be easy to scan and compare
- **Location Input**: Should be easy to use for searching locations

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace location input with `Input` component
4. Replace buttons with `Button` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure weather cards use theme variables
7. Ensure weather icons use theme color variables
8. Test in both light and dark modes
9. Verify all weather information is readable

## Testing Checklist

- [ ] Current weather display is readable in both themes
- [ ] Location input is readable in both themes
- [ ] Forecast cards are readable in both themes
- [ ] Today's forecast is clearly visible in both themes
- [ ] Refresh button works correctly in both themes
- [ ] Weather icons are visible in both themes
- [ ] Error messages are visible in both themes
- [ ] Hover states work correctly in both themes
- [ ] All weather information is clearly displayed

