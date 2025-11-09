# @browser-os/ui

Primitive UI components for browser-os - buttons, inputs, dialogs, and icons.

## Installation

```bash
pnpm add @browser-os/ui
```

## Features

- **Button**: Multiple variants (primary, secondary, ghost, danger) and sizes
- **Input**: Text input with label and error states
- **Dialog**: Modal dialogs with overlay
- **Icon**: Icon component system

## Usage

### Button

```typescript
import { Button } from '@browser-os/ui';

function MyComponent() {
  return (
    <>
      <Button variant="primary" size="md">Click me</Button>
      <Button variant="secondary" size="sm">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Delete</Button>
    </>
  );
}
```

### Input

```typescript
import { Input } from '@browser-os/ui';

function MyForm() {
  return (
    <Input
      label="Email"
      type="email"
      placeholder="Enter your email"
      error="Invalid email"
    />
  );
}
```

### Dialog

```typescript
import { Dialog } from '@browser-os/ui';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="My Dialog">
        <p>Dialog content goes here</p>
      </Dialog>
    </>
  );
}
```

### Icon

```typescript
import { Icon } from '@browser-os/ui';

function MyComponent() {
  return (
    <>
      <Icon name="folder" size={24} />
      <Icon name="file" size={16} />
    </>
  );
}
```

## Components

### Button Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
```

### Input Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

### Dialog Props

```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

### Icon Props

```typescript
interface IconProps {
  name: string;
  size?: number;
  className?: string;
}
```

## Styling

Components use CSS classes that can be styled with theme tokens:

```css
.btn {
  /* Uses --os-bg, --os-fg, --os-accent from theme */
}

.input {
  /* Uses --os-border, --os-radius from theme */
}

.dialog {
  /* Uses --os-shadow, --os-elevation from theme */
}
```

## Accessibility

All components include:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader labels

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

