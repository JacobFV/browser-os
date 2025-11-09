# @browser-os/windows

Windows-style UI components for React.

## Installation

### As a Published Package

```bash
npm install @browser-os/windows
# or
pnpm add @browser-os/windows
# or
yarn add @browser-os/windows
```

### In the Monorepo

This package is part of the browser-os monorepo. When working within the monorepo, it's referenced using the pnpm workspace protocol:

```json
{
  "dependencies": {
    "@browser-os/windows": "workspace:*"
  }
}
```

After adding the dependency, run:

```bash
pnpm install
```

Then build the package:

```bash
pnpm --filter @browser-os/windows build
```

## Usage

```tsx
import { Window, Taskbar, StartMenu } from '@browser-os/windows';
import '@browser-os/windows/styles';

function App() {
  return (
    <>
      <Window title="My Application">
        <p>Window content goes here</p>
      </Window>
      <Taskbar />
    </>
  );
}
```

## Components

### Window

A draggable window component with title bar and controls.

```tsx
<Window
  title="My Window"
  width={600}
  height={400}
  onClose={() => console.log('closed')}
  onMinimize={() => console.log('minimized')}
  onMaximize={() => console.log('maximized')}
>
  Content here
</Window>
```

### Taskbar

A taskbar component with Start button.

```tsx
<Taskbar onStartClick={() => setMenuOpen(true)}>
  {/* Task items */}
</Taskbar>
```

### StartMenu

A Start menu component.

```tsx
<StartMenu
  isOpen={isOpen}
  onClose={() => setMenuOpen(false)}
  items={[
    { label: 'Programs', onClick: () => {} },
    { label: 'Documents', onClick: () => {} },
    { label: 'Settings', onClick: () => {} },
  ]}
/>
```

## Development

This package is built using [tsup](https://tsup.egoist.dev/). To develop:

```bash
# Build once
pnpm build

# Watch mode for development
pnpm dev
```

The package exports both CommonJS and ESM formats, along with TypeScript declarations.

## License

MIT

