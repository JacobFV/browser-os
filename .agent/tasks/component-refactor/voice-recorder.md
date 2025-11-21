# Voice Recorder Component Refactor Plan

## Overview
Refactor the voice recorder app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Recording Display (`src/VoiceRecorder.tsx`)
- **Current**: Custom recording display styling
- **Refactor**: 
  - Use --glass-surface for display container
  - Use theme variables for recording time display
  - Use --text-primary for time text
  - Ensure recording status is clear in both themes
- **Theme Support**: Adaptive recording display styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

### 2. Record Button (`src/VoiceRecorder.tsx`)
- **Current**: Custom record button styling
- **Refactor**: 
  - Replace with `Button` component (primary variant, large size)
  - Use --color-error for record button (red)
  - Use --color-error-shaded for hover state
  - Make record button prominent and circular
- **Theme Support**: Adaptive record button styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

### 3. Control Buttons (`src/VoiceRecorder.tsx`)
- **Current**: Custom control button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for play button
  - Use --color-secondary for stop button
  - Use theme variables for control panel
- **Theme Support**: Adaptive control button styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

### 4. Recording List (`src/VoiceRecorder.tsx`)
- **Current**: Custom recording list item styling
- **Refactor**: 
  - Use --glass-surface for recording item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected recording
  - Use theme variables for recording text
- **Theme Support**: Adaptive recording list styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

### 5. Waveform Display (`src/VoiceRecorder.tsx`)
- **Current**: Custom waveform styling
- **Refactor**: 
  - Use --color-primary for waveform visualization
  - Use theme variables for waveform background
  - Ensure waveform is visible in both themes
- **Theme Support**: Adaptive waveform styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

### 6. Action Buttons (`src/VoiceRecorder.tsx`)
- **Current**: Custom action button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-error for delete button
  - Use --color-secondary for share/download buttons
  - Use theme variables for action buttons
- **Theme Support**: Adaptive action button styling
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

## Main Component

### VoiceRecorder (`src/VoiceRecorder.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure recording interface is clear
- **Files**: `VoiceRecorder.tsx`, `VoiceRecorder.css`

## Color Usage Guidelines

- **Record Button**: Use `--color-error` for record button (red)
- **Primary Actions**: Use `--color-primary` for play button
- **Secondary Actions**: Use `--color-secondary` for stop, share buttons
- **Destructive Actions**: Use `--color-error` for delete button
- **Selected Recording**: Use `--color-primary-lighter` for selected recording
- **Waveform**: Use `--color-primary` for waveform visualization
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`, `--radius-lg` (for circular record button)
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Record Button**: Should be large, circular, and prominently red
- **Recording Status**: Should be clearly visible during recording
- **Waveform**: Should be clearly visible and animated during recording
- **Recording List**: Should be easy to navigate and manage

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`)
3. Replace buttons with `Button` component
4. Update CSS to use theme variables instead of hardcoded colors
5. Ensure recording display uses theme variables
6. Ensure recording list uses theme variables
7. Ensure waveform uses theme color variables
8. Test in both light and dark modes
9. Verify all controls work correctly

## Testing Checklist

- [ ] Recording display is readable in both themes
- [ ] Record button is prominent and visible in both themes
- [ ] Control buttons work correctly in both themes
- [ ] Recording list is readable in both themes
- [ ] Selected recording is clearly visible in both themes
- [ ] Waveform is visible in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Hover states work correctly in both themes

