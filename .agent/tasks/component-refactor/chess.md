# Chess App Component Refactor Plan

## Overview
Refactor the chess app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Chess Board Components (`src/components/`)
- **Current**: Custom chess board styling, pieces
- **Refactor**: 
  - Use theme variables for board squares
  - Ensure pieces are visible in both themes
  - Use --glass-surface for UI panels
  - Use theme variables for move indicators
- **Theme Support**: Adaptive board colors while maintaining chess board contrast
- **Files**: All board-related components

### 2. Game Controls (`src/components/`)
- **Current**: Custom buttons for game actions
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for primary actions (New Game, etc.)
  - Use --color-secondary for secondary actions
  - Use --color-error for resign/forfeit
- **Theme Support**: Adaptive button styling
- **Files**: Control components

### 3. Game Info Panels (`src/components/`)
- **Current**: Custom panels for game state, move history
- **Refactor**: 
  - Use --glass-surface for panel backgrounds
  - Use theme variables for text
  - Use --glass-border-subtle for separators
- **Theme Support**: Adaptive panel styling
- **Files**: Info panel components

### 4. Settings/Dialogs (`src/components/`)
- **Current**: Custom dialogs for game settings
- **Refactor**: 
  - Replace inputs with `Input` component
  - Replace selects with `Select` component
  - Replace buttons with `Button` component
  - Use --glass-surface for dialog backgrounds
- **Theme Support**: Adaptive dialog styling
- **Files**: Dialog components

## Main Component

### Chess (`src/Chess.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Ensure error messages use theme-aware styling
  - Use theme variables for loading states
  - Use theme variables for status messages
- **Files**: `Chess.tsx`, `Chess.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (New Game, Start Game)
- **Secondary Actions**: Use `--color-secondary` (Cancel, Secondary buttons)
- **Destructive Actions**: Use `--color-error` (Resign, Forfeit)
- **Success States**: Use `--color-success` (Checkmate, Win)
- **Warning States**: Use `--color-warning` (Check warnings)
- **Chess Board**: Maintain traditional light/dark squares but use theme-aware colors for UI elements
- **Shaded Variants**: Use `-shaded` variants for hover states

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-error`, `--color-success`, `--color-warning`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Chess Board**: The board itself should maintain traditional chess colors (light/dark squares) for gameplay clarity, but surrounding UI should use theme variables
- **Pieces**: Ensure chess pieces are clearly visible against board squares in both themes
- **Move Indicators**: Use theme-aware colors for highlighting moves while maintaining visibility

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components in each file
3. Replace custom buttons with `Button` component
4. Replace custom inputs/selects with UI components
5. Update CSS to use theme variables for UI elements (not board squares)
6. Ensure chess pieces are visible in both themes
7. Test in both light and dark modes
8. Ensure all dialogs and panels are readable in both themes

## Testing Checklist

- [ ] All buttons work correctly in light mode
- [ ] All buttons work correctly in dark mode
- [ ] Chess board maintains proper contrast in both themes
- [ ] Chess pieces are visible in both themes
- [ ] Move indicators are visible in both themes
- [ ] Game info panels are readable in both themes
- [ ] Dialogs are readable in both themes
- [ ] Input fields are readable in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Status messages are visible in both themes

