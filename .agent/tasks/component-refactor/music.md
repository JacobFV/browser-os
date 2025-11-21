# Music Component Refactor Plan

## Overview
Refactor the music app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Playlist List (`src/Music.tsx`)
- **Current**: Custom playlist item styling
- **Refactor**: 
  - Use --glass-surface for playlist item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected playlist
  - Use theme variables for playlist text
- **Theme Support**: Adaptive playlist styling
- **Files**: `Music.tsx`, `Music.css`

### 2. Now Playing (`src/Music.tsx`)
- **Current**: Custom now playing display
- **Refactor**: 
  - Use --glass-surface for now playing container
  - Use theme variables for track info text
  - Use --color-primary for current track highlight
  - Ensure track info is readable in both themes
- **Theme Support**: Adaptive now playing styling
- **Files**: `Music.tsx`, `Music.css`

### 3. Playback Controls (`src/Music.tsx`)
- **Current**: Custom control buttons
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for play button
  - Use --color-secondary for prev/next buttons
  - Use theme variables for control panel
- **Theme Support**: Adaptive control button styling
- **Files**: `Music.tsx`, `Music.css`

### 4. Progress Bar (`src/Music.tsx`)
- **Current**: Custom progress bar styling
- **Refactor**: 
  - Use --color-primary for progress bar fill
  - Use theme variables for progress bar track
  - Ensure progress bar is visible in both themes
- **Theme Support**: Adaptive progress bar styling
- **Files**: `Music.tsx`, `Music.css`

### 5. Volume Control (`src/Music.tsx`)
- **Current**: Custom volume control styling
- **Refactor**: 
  - Use --color-primary for volume slider
  - Use theme variables for volume control
  - Ensure volume control is visible in both themes
- **Theme Support**: Adaptive volume control styling
- **Files**: `Music.tsx`, `Music.css`

### 6. Track List (`src/Music.tsx`)
- **Current**: Custom track list item styling
- **Refactor**: 
  - Use --glass-surface for track item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for current track
  - Use theme variables for track text
- **Theme Support**: Adaptive track list styling
- **Files**: `Music.tsx`, `Music.css`

## Main Component

### Music (`src/Music.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure music interface is clear
- **Files**: `Music.tsx`, `Music.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for play button, progress bar
- **Secondary Actions**: Use `--color-secondary` for prev/next buttons
- **Current Track**: Use `--color-primary-lighter` for current track highlight
- **Selected Playlist**: Use `--color-primary-lighter` for selected playlist
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

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`)
3. Replace buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure playlist list uses theme variables
6. Ensure track list uses theme variables
7. Ensure progress bar uses theme variables
8. Test in both light and dark modes

## Testing Checklist

- [ ] Playlist list is readable in both themes
- [ ] Now playing display is readable in both themes
- [ ] Playback controls work correctly in both themes
- [ ] Progress bar is visible in both themes
- [ ] Volume control is visible in both themes
- [ ] Track list is readable in both themes
- [ ] Current track is clearly visible in both themes
- [ ] Hover states work correctly in both themes

