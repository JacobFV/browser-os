# Todo Component Refactor Plan

## Overview
Refactor the todo app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Todo List (`src/Todo.tsx`)
- **Current**: Custom todo item styling
- **Refactor**: 
  - Use --glass-surface for todo item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected todo
  - Use theme variables for todo text
- **Theme Support**: Adaptive todo list styling
- **Files**: `Todo.tsx`, `Todo.css`

### 2. Todo Input (`src/Todo.tsx`)
- **Current**: Custom input styling
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for input styling
  - Use --glass-surface for input background
- **Theme Support**: Adaptive input styling
- **Files**: `Todo.tsx`, `Todo.css`

### 3. Todo Checkbox (`src/Todo.tsx`)
- **Current**: Custom checkbox styling
- **Refactor**: 
  - Replace with `Toggle` component or styled checkbox
  - Use --color-success for completed todos
  - Use theme variables for checkbox styling
- **Theme Support**: Adaptive checkbox styling
- **Files**: `Todo.tsx`, `Todo.css`

### 4. Action Buttons (`src/Todo.tsx`)
- **Current**: Custom action button styling
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for add button
  - Use --color-error for delete button
  - Use --color-secondary for secondary actions
- **Theme Support**: Adaptive button styling
- **Files**: `Todo.tsx`, `Todo.css`

### 5. Filter Tabs (`src/Todo.tsx`)
- **Current**: Custom filter tab styling
- **Refactor**: 
  - Use --glass-surface for tab backgrounds
  - Use --color-primary-lighter for active tab
  - Use theme variables for tab borders
- **Theme Support**: Adaptive filter tab styling
- **Files**: `Todo.tsx`, `Todo.css`

### 6. Completed Todos (`src/Todo.tsx`)
- **Current**: Custom completed todo styling
- **Refactor**: 
  - Use --color-success-lighter for completed todo backgrounds
  - Use --text-secondary for completed todo text (strikethrough)
  - Use theme variables for completed styling
- **Theme Support**: Adaptive completed todo styling
- **Files**: `Todo.tsx`, `Todo.css`

## Main Component

### Todo (`src/Todo.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure todo list is clear and readable
- **Files**: `Todo.tsx`, `Todo.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for add button
- **Destructive Actions**: Use `--color-error` for delete button
- **Secondary Actions**: Use `--color-secondary` for secondary actions
- **Completed Todos**: Use `--color-success-lighter` for completed backgrounds
- **Selected Todo**: Use `--color-primary-lighter` for selected todo
- **Active Tab**: Use `--color-primary-lighter` for active filter tab
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-success`, `--color-success-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Completed Todos**: Should be visually distinct but not overwhelming
- **Todo Input**: Should be prominent and easy to use
- **Filter Tabs**: Should clearly show active filter
- **Checkbox**: Should be clear and easy to toggle

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Toggle`)
3. Replace input with `Input` component
4. Replace buttons with `Button` component
5. Replace checkbox with `Toggle` component or styled checkbox
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure todo list uses theme variables
8. Ensure completed todos use success color variants
9. Test in both light and dark modes

## Testing Checklist

- [ ] Todo list is readable in both themes
- [ ] Todo input is readable in both themes
- [ ] Checkbox is visible and functional in both themes
- [ ] Completed todos are clearly visible in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Filter tabs work correctly in both themes
- [ ] Active tab is clearly visible in both themes
- [ ] Selected todo is clearly visible in both themes
- [ ] Hover states work correctly in both themes

