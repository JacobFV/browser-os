# Email Client Component Refactor Plan

**Status:** ✅ Completed

## Overview
Refactor the email client app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. AccountManager (`src/components/AccountManager.tsx`)
- **Current**: Custom buttons and inputs
- **Refactor**: Replace with `Button`, `Input`, `Select` from UI library
- **Theme Support**: Ensure all colors use CSS variables (--color-primary, --color-primary-shaded, etc.)
- **Files**: `AccountManager.tsx`, `AccountManager.css`

### 2. ComposeView (`src/components/ComposeView.tsx`)
- **Current**: Custom form inputs, textarea, buttons
- **Refactor**: 
  - Replace inputs with `Input` component
  - Replace textarea with styled version using theme variables
  - Replace buttons with `Button` component (primary variant for Send)
- **Theme Support**: Use --color-primary for send button, --color-secondary for actions
- **Files**: `ComposeView.tsx`, `ComposeView.css`

### 3. InboxView (`src/components/InboxView.tsx`)
- **Current**: Custom list items, buttons
- **Refactor**: 
  - Use theme variables for list item backgrounds and borders
  - Replace action buttons with `Button` component
  - Ensure hover states use --glass-surface-hover
- **Theme Support**: Adaptive backgrounds, borders, and text colors
- **Files**: `InboxView.tsx`, `InboxView.css`

### 4. EmailDetail (`src/components/EmailDetail.tsx`)
- **Current**: Custom buttons, action bar
- **Refactor**: 
  - Replace action buttons with `Button` component
  - Use theme variables for email content area
- **Theme Support**: Ensure email content is readable in both themes
- **Files**: `EmailDetail.tsx`, `EmailDetail.css`

### 5. FolderSidebar (`src/components/FolderSidebar.tsx`)
- **Current**: Custom sidebar styling
- **Refactor**: 
  - Use --glass-surface for sidebar background
  - Use theme variables for active/hover states
  - Replace any buttons with `Button` component
- **Theme Support**: Adaptive sidebar colors
- **Files**: `FolderSidebar.tsx`, `FolderSidebar.css`

### 6. OAuthFlow (`src/components/OAuthFlow.tsx`)
- **Current**: Custom buttons and form elements
- **Refactor**: 
  - Replace buttons with `Button` component
  - Replace inputs with `Input` component
- **Theme Support**: Use primary color variants for OAuth buttons
- **Files**: `OAuthFlow.tsx`, `OAuthFlow.css`

### 7. EmailRenderer (`src/components/EmailRenderer.tsx`)
- **Current**: Custom email content rendering
- **Refactor**: 
  - Ensure email content uses theme-aware text colors
  - Use theme variables for email body background
- **Theme Support**: Readable email content in both themes
- **Files**: `EmailRenderer.tsx`, `EmailRenderer.css`

## Main Component

### EmailClient (`src/EmailClient.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Ensure error messages use theme-aware styling
  - Use theme variables for loading states
- **Files**: `EmailClient.tsx`, `EmailClient.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (Send email, Connect account)
- **Secondary Actions**: Use `--color-secondary` (Cancel, Secondary buttons)
- **Success States**: Use `--color-success` (Email sent, Connected)
- **Error States**: Use `--color-error` (Connection failed, Send error)
- **Warning States**: Use `--color-warning` (OAuth warnings)
- **Shaded Variants**: Use `-shaded` variants for hover states on colored buttons
- **Light Variants**: Use `-lighter` variants for subtle backgrounds

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-light`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-success`, `--color-error`, `--color-warning`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--blur-md`, `--blur-lg`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components in each file
3. Replace custom buttons with `Button` component
4. Replace custom inputs with `Input` component
5. Replace custom selects with `Select` component
6. Update CSS to use theme variables instead of hardcoded colors
7. Test in both light and dark modes
8. Ensure all interactive elements have proper hover/focus states using theme variables

## Testing Checklist

- [ ] All buttons work correctly in light mode
- [ ] All buttons work correctly in dark mode
- [ ] Form inputs are readable in both themes
- [ ] Email content is readable in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Error messages are visible in both themes
- [ ] Loading states are visible in both themes

