# Other Apps Component Refactor Plan

## Overview
Refactor remaining apps to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Apps to Refactor

### 1. Browser (`system-apps/browser`)
- **Components**: Address bar, navigation buttons, tabs, bookmarks
- **Refactor**: 
  - Replace buttons with `Button` component
  - Replace inputs with `Input` component
  - Use theme variables for address bar, tabs, bookmarks
  - Use --color-primary for primary navigation actions
- **Files**: `Browser.tsx`, `Browser.css`

### 2. Calculator (`system-apps/calculator`)
- **Components**: Number buttons, operation buttons, display
- **Refactor**: 
  - Use theme variables for button backgrounds
  - Use --color-primary for equals/calculate button
  - Use --color-secondary for operation buttons
  - Use --glass-surface for display area
- **Files**: `Calculator.tsx`, `Calculator.css`

### 3. Calendar (`system-apps/calendar`)
- **Components**: Calendar grid, event items, navigation buttons
- **Refactor**: 
  - Use theme variables for calendar cells
  - Use --color-primary for today/selected dates
  - Replace buttons with `Button` component
  - Use --glass-surface for event items
- **Files**: `Calendar.tsx`, `Calendar.css`

### 4. Clock (`system-apps/clock`)
- **Components**: Time display, settings buttons
- **Refactor**: 
  - Use theme variables for display background
  - Replace buttons with `Button` component
  - Use --text-primary for time display
- **Files**: `Clock.tsx`, `Clock.css`

### 5. Contacts (`system-apps/contacts`)
- **Components**: Contact list, form inputs, action buttons
- **Refactor**: 
  - Replace inputs with `Input` component
  - Replace buttons with `Button` component
  - Use theme variables for contact list items
  - Use --glass-surface-hover for hover states
- **Files**: `Contacts.tsx`, `Contacts.css`

### 6. Draw (`system-apps/draw`)
- **Components**: Toolbar, canvas controls, color picker
- **Refactor**: 
  - Replace toolbar buttons with `Button` component
  - Use theme variables for toolbar background
  - Use --glass-surface for panels
- **Files**: `Draw.tsx`, `Draw.css`, toolbar components

### 7. Notepad (`system-apps/notepad`)
- **Components**: Text editor, menu buttons
- **Refactor**: 
  - Use theme variables for editor background
  - Replace buttons with `Button` component
  - Ensure text is readable in both themes
- **Files**: `Notepad.tsx`, `Notepad.css`

### 8. Notes (`system-apps/notes`)
- **Components**: Note list, editor, action buttons
- **Refactor**: 
  - Replace inputs with `Input` component
  - Replace buttons with `Button` component
  - Use theme variables for note list items
- **Files**: `Notes.tsx`, `Notes.css`

### 9. Terminal (`system-apps/terminal`)
- **Components**: Terminal output, input, settings
- **Refactor**: 
  - Use theme variables for terminal background
  - Ensure terminal text is readable in both themes
  - Replace settings buttons with `Button` component
- **Files**: Terminal components

### 10. Todo (`system-apps/todo`)
- **Components**: Todo list, input, action buttons
- **Refactor**: 
  - Replace inputs with `Input` component
  - Replace buttons with `Button` component
  - Use theme variables for todo items
  - Use --color-success for completed items
- **Files**: `Todo.tsx`, `Todo.css`

### 11. Process Manager (`system-apps/process-manager`)
- **Components**: Process list, action buttons
- **Refactor**: 
  - Use theme variables for process list items
  - Replace buttons with `Button` component
  - Use --color-error for kill/terminate actions
- **Files**: Process manager components

### 12. System Monitor (`system-apps/system-monitor`)
- **Components**: Charts, metrics display
- **Refactor**: 
  - Use theme variables for chart backgrounds
  - Use --color-primary, --color-secondary for chart colors
  - Ensure charts are readable in both themes
- **Files**: `SystemMonitor.tsx`, `SystemMonitor.css`

## Color Usage Guidelines (All Apps)

- **Primary Actions**: Use `--color-primary` for main actions
- **Secondary Actions**: Use `--color-secondary` for secondary actions
- **Destructive Actions**: Use `--color-error` for delete/remove actions
- **Success States**: Use `--color-success` for success indicators
- **Warning States**: Use `--color-warning` for warnings
- **Hover States**: Use `--glass-surface-hover`
- **Active States**: Use `--glass-surface-active`

## CSS Variables to Use (All Apps)

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-success`, `--color-error`, `--color-warning`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--blur-md`, `--blur-lg`

## Implementation Steps (Per App)

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Select`, `Toggle`)
3. Replace custom buttons with `Button` component
4. Replace custom inputs with `Input` component
5. Replace custom selects with `Select` component
6. Update CSS to use theme variables instead of hardcoded colors
7. Test in both light and dark modes
8. Ensure all interactive elements have proper hover/focus states

## Testing Checklist (Per App)

- [ ] All buttons work correctly in light mode
- [ ] All buttons work correctly in dark mode
- [ ] All inputs are readable in both themes
- [ ] All text is readable in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Error messages are visible in both themes
- [ ] Loading states are visible in both themes
- [ ] App-specific UI elements are visible in both themes

