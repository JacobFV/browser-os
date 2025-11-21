# Password Manager Component Refactor Plan

## Overview
Refactor the password manager app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. Password List (`src/PasswordManager.tsx`)
- **Current**: Custom password entry item styling
- **Refactor**: 
  - Use --glass-surface for entry item backgrounds
  - Use --glass-surface-hover for hover states
  - Use --color-primary-lighter for selected entry
  - Use theme variables for entry text
- **Theme Support**: Adaptive password list styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

### 2. Password Form (`src/PasswordManager.tsx`)
- **Current**: Custom form inputs
- **Refactor**: 
  - Replace inputs with `Input` component
  - Use theme variables for form background
  - Use --glass-surface for form container
  - Ensure form is readable in both themes
- **Theme Support**: Adaptive form styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

### 3. Password Visibility Toggle (`src/PasswordManager.tsx`)
- **Current**: Custom toggle button
- **Refactor**: 
  - Replace with `Toggle` component
  - Use theme variables for toggle styling
  - Ensure toggle state is clear in both themes
- **Theme Support**: Adaptive toggle styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

### 4. Action Buttons (`src/PasswordManager.tsx`)
- **Current**: Custom buttons for add, edit, delete
- **Refactor**: 
  - Replace buttons with `Button` component
  - Use --color-primary for add/save buttons
  - Use --color-error for delete button
  - Use --color-secondary for cancel button
- **Theme Support**: Adaptive button styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

### 5. Search Bar (`src/PasswordManager.tsx`)
- **Current**: Custom search input
- **Refactor**: 
  - Replace with `Input` component
  - Use theme variables for search bar styling
  - Use --glass-surface for search bar background
- **Theme Support**: Adaptive search bar styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

### 6. Password Strength Indicator (`src/PasswordManager.tsx`)
- **Current**: Custom strength indicator styling
- **Refactor**: 
  - Use --color-success for strong passwords
  - Use --color-warning for medium passwords
  - Use --color-error for weak passwords
  - Use theme variables for indicator background
- **Theme Support**: Adaptive strength indicator styling
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

## Main Component

### PasswordManager (`src/PasswordManager.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Use theme variables for app background
  - Use --glass-surface for UI panels
  - Ensure security-focused UI is clear
- **Files**: `PasswordManager.tsx`, `PasswordManager.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` for add, save actions
- **Destructive Actions**: Use `--color-error` for delete action
- **Secondary Actions**: Use `--color-secondary` for cancel, secondary buttons
- **Selected Entry**: Use `--color-primary-lighter` for selected entry background
- **Password Strength**: Use `--color-success`, `--color-warning`, `--color-error`
- **Hover States**: Use `--glass-surface-hover` or `-shaded` variants

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-error`, `--color-error-shaded`
- `--color-success`, `--color-warning`
- `--color-secondary`, `--color-secondary-shaded`
- `--radius-sm`, `--radius-md`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Special Considerations

- **Security**: UI should feel secure and trustworthy
- **Password Visibility**: Toggle should be clear and accessible
- **Form Fields**: Should be easy to fill out in both themes
- **Strength Indicator**: Should be clearly visible and understandable

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components (`Button`, `Input`, `Toggle`)
3. Replace form inputs with `Input` component
4. Replace buttons with `Button` component
5. Replace toggle with `Toggle` component
6. Update CSS to use theme variables instead of hardcoded colors
7. Ensure password list uses theme variables
8. Ensure form uses theme variables
9. Test in both light and dark modes

## Testing Checklist

- [ ] Password list is readable in both themes
- [ ] Selected entry is clearly visible in both themes
- [ ] Password form is readable in both themes
- [ ] Form inputs are usable in both themes
- [ ] Password visibility toggle works correctly in both themes
- [ ] Action buttons work correctly in both themes
- [ ] Search bar is readable in both themes
- [ ] Password strength indicator is visible in both themes
- [ ] Hover states work correctly in both themes

