# Messaging Client Component Refactor Plan

## Overview
Refactor the messaging client app to use `@browser-os/ui` components for consistent theming and adaptive light/dark mode support.

## Components to Refactor

### 1. ConversationList (`src/components/ConversationList.tsx`)
- **Current**: Custom list items, styling
- **Refactor**: 
  - Use theme variables for list item backgrounds
  - Replace any buttons with `Button` component
  - Use --glass-surface for item backgrounds
  - Use --glass-surface-hover for hover states
- **Theme Support**: Adaptive list item colors
- **Files**: `ConversationList.tsx`, `ConversationList.css` (if exists)

### 2. ConversationHeader (`src/components/ConversationHeader.tsx`)
- **Current**: Custom header with buttons
- **Refactor**: 
  - Replace action buttons with `Button` component
  - Use theme variables for header background
  - Use --color-primary for primary actions
- **Theme Support**: Adaptive header styling
- **Files**: `ConversationHeader.tsx`, `ConversationHeader.css` (if exists)

### 3. MessageList (`src/components/MessageList.tsx`)
- **Current**: Custom message bubbles, timestamps
- **Refactor**: 
  - Use theme variables for message bubble backgrounds
  - Use --color-primary-lighter for sent messages
  - Use --glass-surface for received messages
  - Ensure text is readable in both themes
- **Theme Support**: Adaptive message bubble colors
- **Files**: `MessageList.tsx`, `MessageList.css` (if exists)

### 4. MessageInput (`src/components/MessageInput.tsx`)
- **Current**: Custom textarea and send button
- **Refactor**: 
  - Replace textarea with styled version using theme variables
  - Replace send button with `Button` component (primary variant)
  - Use `Input` component if there are any input fields
- **Theme Support**: Adaptive input styling
- **Files**: `MessageInput.tsx`, `MessageInput.css` (if exists)

### 5. ConnectionStatus (`src/components/ConnectionStatus.tsx`)
- **Current**: Custom status indicator
- **Refactor**: 
  - Use --color-success for connected state
  - Use --color-error for disconnected state
  - Use --color-warning for connecting/reconnecting states
  - Use theme variables for status indicator background
- **Theme Support**: Adaptive status colors
- **Files**: `ConnectionStatus.tsx`, `ConnectionStatus.css` (if exists)

## Main Component

### MessagingClient (`src/MessagingClient.tsx`)
- **Current**: Container component
- **Refactor**: 
  - Ensure error messages use theme-aware styling
  - Use theme variables for loading states
  - Replace any buttons with `Button` component
- **Files**: `MessagingClient.tsx`, `MessagingClient.css`

## Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (Send message, Connect)
- **Secondary Actions**: Use `--color-secondary` (Cancel, Secondary buttons)
- **Success States**: Use `--color-success` (Connected, Message sent)
- **Error States**: Use `--color-error` (Connection failed, Send error)
- **Warning States**: Use `--color-warning` (Reconnecting, Connection issues)
- **Message Bubbles**: 
  - Sent: `--color-primary-lighter` background
  - Received: `--glass-surface` background
- **Shaded Variants**: Use `-shaded` variants for hover states

## CSS Variables to Use

- `--glass-surface`, `--glass-surface-hover`, `--glass-surface-active`
- `--glass-border`, `--glass-border-subtle`
- `--text-primary`, `--text-secondary`, `--text-light`
- `--color-primary`, `--color-primary-shaded`, `--color-primary-lighter`
- `--color-secondary`, `--color-secondary-shaded`
- `--color-success`, `--color-error`, `--color-warning`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`
- `--blur-md`

## Implementation Steps

1. Add `@browser-os/ui` dependency to `package.json`
2. Import UI components in each file
3. Replace custom buttons with `Button` component
4. Replace custom inputs/textareas with styled versions using theme variables
5. Update CSS to use theme variables instead of hardcoded colors
6. Ensure message bubbles are readable in both themes
7. Test in both light and dark modes
8. Ensure all interactive elements have proper hover/focus states

## Testing Checklist

- [ ] All buttons work correctly in light mode
- [ ] All buttons work correctly in dark mode
- [ ] Message input is readable in both themes
- [ ] Message bubbles are readable in both themes
- [ ] Sent messages are visually distinct in both themes
- [ ] Received messages are visually distinct in both themes
- [ ] Connection status is visible in both themes
- [ ] Hover states use appropriate theme colors
- [ ] Focus states are visible in both themes
- [ ] Error messages are visible in both themes

