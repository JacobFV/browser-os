# Contacts Component Refactor Plan

## Overview
Refactor the contacts app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Contact List (`src/Contacts.tsx`)
- **Current**: Custom contact list item styling
- **Refactor**: 
  - Use --glass-surface for contact item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected contact
  - Use theme variables for contact text
- **Theme Support**: Adaptive contact list styling
- **Files**: `Contacts.tsx`, `Contacts.css`

### 2. Contact Form (`src/Contacts.tsx`)
- **Current**: Custom form inputs
- **Refactor**: 
  - Replace inputs with `Input` component
  - Use theme variables for form background
  - Use --glass-surface for form container
  - Ensure form is readable in both themes
- **Theme Support**: Adaptive form styling
- **Files**: `Contacts.tsx`, `Contacts.css`

### 3. Action Buttons (`src/Contacts.tsx`)
- **Current**: Custom buttons for add, edit, delete
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for add/edit buttons
  - Use --color-error for delete button
  - Use --color-secondary for cancel button
- **Theme Support**: Adaptive button styling
- **Files**: `Contacts.tsx`, `Contacts.css`

### 4. Search Bar (`src/Contacts.tsx`)
- **Current**: Custom search input
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for search bar styling
  - Use --glass-surface for search bar background
- **Theme Support**: Adaptive search bar styling
- **Files**: `Contacts.tsx`, `Contacts.css`

### 5. Contact Detail View (`src/Contacts.tsx`)
- **Current**: Custom detail view styling
- **Refactor**: 
  - Use theme variables for detail view background
  - Use --glass-surface for detail container
  - Use theme variables for contact information text
  - Ensure details are readable in both themes
- **Theme Support**: Adaptive detail view styling
- **Files**: `Contacts.tsx`, `Contacts.css`

### 6. Contact Groups/Tags (`src/Contacts.tsx`)
- **Current**: Custom group/tag styling
- **Refactor**: 
  - Use --color-secondary-lighter for group backgrounds
  - Use theme variables for group text
  - Ensure groups are visible in both themes
- **Theme Support**: Adaptive group styling
- **Files**: `Contacts.tsx`, `Contacts.css`

## Main Component

### Contacts (`src/Contacts.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for contacts app background
  - Use --glass-surface for UI panels
  - Ensure layout is clear in both themes
- **Files**: `Contacts.tsx`, `Contacts.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for add, edit, save buttons
- **Destructive Actions**: Use `--color-error` for delete button
- **Secondary Actions**: Use `--color-secondary` for cancel, secondary buttons
- **Selected Contact**: Use `--color-primary-lighter` for selected contact background
- **Hover States**: Use `--glass-surface-hover`
- **Groups/Tags**: Use `--color-secondary-lighter` for group backgrounds

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-secondary`, `--color-secondary-shaded`, `--color-secondary-lighter`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Contact List**: Should be scrollable and clearly show contact names
- **Form**: Should be easy to fill out in both themes
- **Search**: Should be prominent and easy to use
- **Detail View**: Should clearly display all contact information

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`)
3. Replace form inputs with `Input` component
4. Replace buttons with `Button` component
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure contact list uses theme variables
7. Ensure form uses theme variables
8. Test in both light and dark modes
9. Verify all interactive elements work correctly

## Testing Checklist

- [ ] Contact list is readable in both themes
- [ ] Selected contact is clearly visible in both themes
- [ ] Contact form is readable in both themes
- [ ] Form inputs are usable in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Search bar is readable in both themes
- [ ] Contact detail view is readable in both themes
- [ ] Groups/tags are visible in both themes
- [ ] Hover states work correctly in both themes
- [ ] All buttons have proper focus states

