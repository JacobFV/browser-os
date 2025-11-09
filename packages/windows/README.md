# @browser-os/windows

Windows-style UI components for React.

## Installation

```bash
npm install @browser-os/windows
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

## License

MIT

