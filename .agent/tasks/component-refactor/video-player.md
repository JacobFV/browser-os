# Video Player Component Refactor Plan

## Overview
Refactor the video player app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Video Display Area (`src/VideoPlayer.tsx`)
- **Current**: Custom video container styling
- **Refactor**: 
  - Use theme variables for video container border
  - Use --glass-surface for video container background
  - Ensure video area is clearly defined in both themes
- **Theme Support**: Adaptive video container styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

### 2. Playback Controls (`src/VideoPlayer.tsx`)
- **Current**: Custom control button styling
- **Refactor**: 
  - Replace buttons with `Button` component (ghost variant for icon buttons)
  - Use --color-primary for play button
  - Use --color-secondary for prev/next buttons
  - Use theme variables for control panel
- **Theme Support**: Adaptive control button styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

### 3. Progress Bar (`src/VideoPlayer.tsx`)
- **Current**: Custom progress bar styling
- **Refactor**: 
  - Use --color-primary for progress bar fill
  - Use theme variables for progress bar track
  - Ensure progress bar is visible in both themes
- **Theme Support**: Adaptive progress bar styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

### 4. Volume Control (`src/VideoPlayer.tsx`)
- **Current**: Custom volume control styling
- **Refactor**: 
  - Use --color-primary for volume slider
  - Use theme variables for volume control
  - Ensure volume control is visible in both themes
- **Theme Support**: Adaptive volume control styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

### 5. Playlist (`src/VideoPlayer.tsx`)
- **Current**: Custom playlist item styling
- **Refactor**: 
  - Use --glass-surface for playlist item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for current video
  - Use theme variables for playlist text
- **Theme Support**: Adaptive playlist styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

### 6. Settings Panel (`src/VideoPlayer.tsx`)
- **Current**: Custom settings panel styling
- **Refactor**: 
  - Use --glass-surface for settings panel background
  - Replace selects with `Select` component
  - Replace toggles with `Toggle` component
  - Use theme variables for settings panel
- **Theme Support**: Adaptive settings panel styling
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

## Main Component

### VideoPlayer (`src/VideoPlayer.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure video area is prominent
- **Files**: `VideoPlayer.tsx`, `VideoPlayer.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for play button, progress bar
- **Secondary Actions**: Use `--color-secondary` for prev/next buttons
- **Current Video**: Use `--color-primary-lighter` for current video in playlist
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants
- **Controls**: Use `--glass-surface` for control panel background

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

- **Video Display**: Should be clearly defined but not interfere with video viewing
- **Dark Controls**: Consider dark background for control panel
- **Playlist**: Should be visible but not interfere with video
- **Progress Bar**: Should be clearly visible and interactive

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Select`, `Toggle`)
3. Replace buttons with `Button` component
4. Replace selects/toggles with UI components
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure video container uses theme variables
7. Ensure control panel uses theme variables
8. Test in both light and dark modes
9. Verify all controls work correctly

## Testing Checklist

- [ ] Video display area is styled appropriately in both themes
- [ ] Playback controls work correctly in both themes
- [ ] Progress bar is visible in both themes
- [ ] Volume control is visible in both themes
- [ ] Playlist is readable in both themes
- [ ] Current video is clearly visible in both themes
- [ ] Settings panel is readable in both themes
- [ ] Hover states work correctly in both themes

