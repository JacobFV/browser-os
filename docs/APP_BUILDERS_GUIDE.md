# Browser OS App Builders Guide

Complete guide for building beautiful, theme-aware applications for Browser OS using the `@browser-os/ui` component library.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Setup](#project-setup)
- [UI Component Library](#ui-component-library)
- [Theme System](#theme-system)
- [Design Principles](#design-principles)
- [Component Examples](#component-examples)
- [Styling Guidelines](#styling-guidelines)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Quick Start

### 1. Create Your App Structure

```bash
system-apps/my-app/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── index.ts
    ├── MyApp.tsx
    └── MyApp.css
```

### 2. Install Dependencies

Add to your `package.json`:

```json
{
  "dependencies": {
    "@browser-os/ui": "workspace:*",
    "@browser-os/schemas": "workspace:*",
    "@browser-os/events": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 3. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
      '@browser-os/events': path.resolve(__dirname, '../../packages/events/src'),
      '@browser-os/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BrowserOSMyApp',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

### 4. Create Your Component

```typescript
// src/MyApp.tsx
import React from 'react';
import { Button, Input, useTheme } from '@browser-os/ui';
import './MyApp.css';

export const MyApp: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="my-app">
      <h1>My App</h1>
      <Input placeholder="Enter text..." />
      <Button variant="primary">Click Me</Button>
    </div>
  );
};
```

### 5. Style with Theme Variables

```css
/* src/MyApp.css */
.my-app {
  padding: 24px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.my-app h1 {
  color: var(--text-primary);
  margin-bottom: 16px;
}
```

## Project Setup

### Package.json Template

```json
{
  "name": "@browser-os/my-app",
  "version": "0.1.0",
  "description": "My Browser OS app",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@browser-os/ui": "workspace:*",
    "@browser-os/schemas": "workspace:*",
    "@browser-os/events": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### TypeScript Config

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

## UI Component Library

### Available Components

The `@browser-os/ui` package provides:

- **Button** - Primary, secondary, and ghost variants
- **Input** - Text inputs with theme support
- **Select** - Native select dropdowns
- **Dropdown** - Custom dropdown component
- **Toggle** - Switch/toggle component
- **ThemeProvider** - Theme context provider
- **useTheme** - Hook to access theme state

### Importing Components

```typescript
import { 
  Button, 
  Input, 
  Select, 
  Dropdown, 
  Toggle,
  ThemeProvider,
  useTheme,
  type Theme,
  type WindowButtonSide
} from '@browser-os/ui';
```

### Button Component

```typescript
import { Button } from '@browser-os/ui';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save
</Button>

// Secondary button
<Button variant="secondary" onClick={handleClick}>
  Cancel
</Button>

// Ghost button
<Button variant="ghost" onClick={handleClick}>
  More Options
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

### Input Component

```typescript
import { Input } from '@browser-os/ui';

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input
  type="email"
  placeholder="email@example.com"
/>

<Input
  type="password"
  placeholder="Password"
/>
```

### Dropdown Component

```typescript
import { Dropdown } from '@browser-os/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<Dropdown
  options={options}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  placeholder="Select an option..."
/>
```

### Toggle Component

```typescript
import { Toggle } from '@browser-os/ui';

<Toggle
  checked={isEnabled}
  onChange={(checked) => setIsEnabled(checked)}
  label="Enable feature"
/>
```

## Theme System

### Using Theme Variables

All colors, spacing, and effects are available as CSS variables:

```css
.my-component {
  /* Colors */
  color: var(--text-primary);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border-subtle);
  
  /* Spacing */
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  
  /* Effects */
  backdrop-filter: blur(var(--blur-md)) saturate(120%);
  box-shadow: var(--shadow-md);
  
  /* Animations */
  transition: all 0.2s var(--ease-smooth);
}
```

### Available CSS Variables

#### Colors

**Text Colors:**
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary/muted text
- `--text-light` - Light text (for dark backgrounds)

**Glass Surfaces:**
- `--glass-surface` - Translucent surface background
- `--glass-surface-hover` - Hover state
- `--glass-surface-active` - Active/pressed state
- `--glass-border` - Border color
- `--glass-border-subtle` - Subtle border color

**Primary Colors:**
- `--color-primary` - Primary brand color
- `--color-primary-shaded` - Darker primary (hover states)
- `--color-primary-light` - Lighter primary
- `--color-primary-lighter` - Very light primary (backgrounds)
- `--color-primary-dark` - Dark primary
- `--color-primary-darker` - Very dark primary

**Secondary Colors:**
- `--color-secondary` - Secondary brand color
- `--color-secondary-shaded` - Darker secondary
- `--color-secondary-light` - Lighter secondary
- `--color-secondary-lighter` - Very light secondary

**Status Colors:**
- `--color-success` - Success/positive actions
- `--color-success-shaded` - Darker success
- `--color-success-lighter` - Light success background
- `--color-warning` - Warning/caution
- `--color-warning-shaded` - Darker warning
- `--color-warning-lighter` - Light warning background
- `--color-error` - Error/destructive actions
- `--color-error-shaded` - Darker error
- `--color-error-lighter` - Light error background

#### Spacing & Radii

- `--radius-sm` - 8px
- `--radius-md` - 14px
- `--radius-lg` - 20px
- `--radius-xl` - 28px

#### Shadows

- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow
- `--shadow-glow` - Glow effect

#### Effects

- `--blur-md` - 25px blur
- `--blur-lg` - 50px blur

#### Animations

- `--ease-smooth` - Smooth easing curve
- `--ease-bounce` - Bouncy easing curve

#### Backgrounds

- `--bg-primary` - Primary background gradient

### Using Theme Hook

```typescript
import { useTheme } from '@browser-os/ui';

function MyComponent() {
  const { theme, setTheme, windowButtonSide } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Dark Mode Support

All CSS variables automatically adapt to dark mode when `[data-theme="dark"]` is set on the root element. Your components will automatically support dark mode if you use theme variables.

```css
/* Automatically works in both themes */
.my-button {
  background: var(--color-primary);
  color: var(--text-light);
}

/* Dark mode specific adjustments */
[data-theme="dark"] .my-button {
  /* Additional dark mode styles if needed */
}
```

## Design Principles

### Core Philosophy: "Naked Content"

**The window is the container. The content is naked.**

- Content should sit directly on the window background
- Avoid unnecessary container boxes
- Use whitespace and typography for hierarchy
- Let the window's glassmorphism do the work

### ❌ Avoid: Container Nesting

```css
/* Bad: Unnecessary container */
.settings-section-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border-subtle);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  border-radius: var(--radius-md);
}
```

### ✅ Prefer: Direct Content

```css
/* Good: Direct content placement */
.settings-section-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0; /* No container styling */
}
```

### Visual Hierarchy

Create hierarchy through:

1. **Typography** - Headings, font sizes, weights
2. **Whitespace** - Padding, margins, gaps
3. **Color** - Text colors, subtle borders (only when needed)
4. **Interactive States** - Hover, focus, active states

**NOT through:**
- Background boxes
- Border containers
- Shadow layers
- Nested card components

### When Containers ARE Acceptable

Containers with backgrounds/borders are acceptable ONLY when:

1. **Modal/Dialog Windows** - Distinct overlays
2. **Dropdown Menus** - Floating menus
3. **Tooltips** - Floating information
4. **Error/Success Messages** - Alerts needing prominence
5. **Input Fields** - Form inputs themselves (not containers)

## Component Examples

### Form Example

```typescript
import React, { useState } from 'react';
import { Button, Input, Dropdown, Toggle } from '@browser-os/ui';
import './FormExample.css';

export const FormExample: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [enabled, setEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form className="form-example" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <Dropdown
          options={[
            { value: 'cat1', label: 'Category 1' },
            { value: 'cat2', label: 'Category 2' },
          ]}
          value={category}
          onChange={setCategory}
          placeholder="Select category"
        />
      </div>

      <div className="form-group">
        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label="Enable notifications"
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary">Cancel</Button>
        <Button type="submit" variant="primary">Save</Button>
      </div>
    </form>
  );
};
```

```css
/* FormExample.css */
.form-example {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
```

### List Example

```typescript
import React from 'react';
import { Button } from '@browser-os/ui';
import './ListExample.css';

interface Item {
  id: string;
  name: string;
  description: string;
}

export const ListExample: React.FC = () => {
  const items: Item[] = [
    { id: '1', name: 'Item 1', description: 'Description 1' },
    { id: '2', name: 'Item 2', description: 'Description 2' },
  ];

  return (
    <div className="list-example">
      {items.map(item => (
        <div key={item.id} className="list-item">
          <div className="list-item-content">
            <h3 className="list-item-name">{item.name}</h3>
            <p className="list-item-description">{item.description}</p>
          </div>
          <div className="list-item-actions">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm">Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

```css
/* ListExample.css */
.list-example {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border-subtle);
  transition: background-color 0.2s var(--ease-smooth);
}

.list-item:hover {
  background: var(--glass-surface-hover);
}

.list-item-content {
  flex: 1;
}

.list-item-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.list-item-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.list-item-actions {
  display: flex;
  gap: 8px;
}
```

## Styling Guidelines

### Glassmorphism Effects

Use backdrop-filter for glassmorphism:

```css
.glass-panel {
  background: var(--glass-surface);
  backdrop-filter: blur(var(--blur-md)) saturate(120%);
  -webkit-backdrop-filter: blur(var(--blur-md)) saturate(120%);
  border: 1px solid var(--glass-border-subtle);
  border-radius: var(--radius-md);
}
```

### Hover States

```css
.interactive-element {
  transition: all 0.2s var(--ease-smooth);
}

.interactive-element:hover {
  background: var(--glass-surface-hover);
  border-color: var(--glass-border);
}
```

### Focus States

```css
.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-surface-hover);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}
```

### Scrollbars

Style scrollbars for dark mode:

```css
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 4px;
  transition: background 0.2s var(--ease-smooth);
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--glass-border-subtle);
}

[data-theme="dark"] .scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

## Best Practices

### 1. Always Use Theme Variables

✅ **Good:**
```css
.button {
  background: var(--color-primary);
  color: var(--text-light);
}
```

❌ **Bad:**
```css
.button {
  background: #007aff;
  color: #ffffff;
}
```

### 2. Use Component Library

✅ **Good:**
```typescript
import { Button } from '@browser-os/ui';
<Button variant="primary">Save</Button>
```

❌ **Bad:**
```typescript
<button className="custom-button">Save</button>
```

### 3. Avoid Container Nesting

✅ **Good:**
```css
.settings-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
```

❌ **Bad:**
```css
.settings-section {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  padding: 24px;
  border-radius: var(--radius-md);
}
```

### 4. Consistent Spacing

Use consistent spacing scale:
- Small: 8px
- Medium: 16px
- Large: 24px
- Extra Large: 32px

### 5. Semantic HTML

Use semantic HTML elements:
- `<form>` for forms
- `<nav>` for navigation
- `<main>` for main content
- `<section>` for sections
- `<article>` for articles

### 6. Accessibility

- Use proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper focus states
- Use semantic HTML
- Ensure color contrast meets WCAG standards

## Common Patterns

### Modal Dialog

```typescript
import React from 'react';
import { Button } from '@browser-os/ui';
import './Modal.css';

export const Modal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    </div>
  );
};
```

```css
/* Modal.css */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--glass-surface);
  backdrop-filter: blur(var(--blur-lg)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blur-lg)) saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.modal-content h2 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
```

### Loading State

```typescript
import React from 'react';
import './Loading.css';

export const Loading: React.FC = () => {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};
```

```css
/* Loading.css */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--glass-border-subtle);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Empty State

```typescript
import React from 'react';
import { Button } from '@browser-os/ui';
import './EmptyState.css';

export const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📝</div>
      <h3 className="empty-state-title">No items yet</h3>
      <p className="empty-state-description">
        Get started by creating your first item
      </p>
      <Button variant="primary" onClick={onCreate}>
        Create Item
      </Button>
    </div>
  );
};
```

```css
/* EmptyState.css */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
}
```

## Resources

- [Design Principles](../.agent/DESIGN_PRINCIPLES.md) - Core design philosophy
- [Component Refactor Plans](../.agent/tasks/component-refactor/) - Examples from existing apps
- [UI Package Source](../../packages/ui/src/) - Component implementations
- [Example Apps](../../system-apps/) - Reference implementations

## Getting Help

- Check existing apps in `system-apps/` for examples
- Review component implementations in `packages/ui/src/components/`
- See design principles in `.agent/DESIGN_PRINCIPLES.md`
- Check refactor plans for migration examples

---

**Remember:** The window is the container. The content is naked. Let the beautiful glassmorphism do the work!

