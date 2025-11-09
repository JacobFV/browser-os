# @browser-os/shell

Desktop and mobile shell composition for browser-os.

## Installation

```bash
pnpm add @browser-os/shell
```

## Features

- **Desktop Shell**: Full desktop mode with windows, taskbar, desktop
- **Mobile Shell**: Mobile mode with full-screen apps and switcher
- **Mode Switching**: Seamless switching between desktop and mobile
- **Responsive**: Adapts to screen size and orientation

## Usage

### Basic Shell

```typescript
import { Shell } from '@browser-os/shell';

function App() {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [windows, setWindows] = useState([]);
  const [desktopIcons, setDesktopIcons] = useState([
    { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
  ]);
  
  return (
    <Shell
      mode={mode}
      windows={windows}
      desktopIcons={desktopIcons}
      onWindowClick={(winId) => {
        windowManager.focusWindow(winId);
      }}
      onIconClick={(icon) => {
        openWindow({ appId: icon.appId, title: icon.label });
      }}
    />
  );
}
```

### Mode Detection

```typescript
import { useEffect, useState } from 'react';

function useShellMode() {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  
  useEffect(() => {
    const checkMode = () => {
      const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setMode(isMobile ? 'mobile' : 'desktop');
    };
    
    checkMode();
    window.addEventListener('resize', checkMode);
    return () => window.removeEventListener('resize', checkMode);
  }, []);
  
  return mode;
}
```

## Shell Props

```typescript
interface ShellProps {
  mode?: 'desktop' | 'mobile';
  windows: Array<{ id: string; title: string; appId: string }>;
  desktopIcons: Array<{
    id: string;
    label: string;
    icon?: string;
    appId?: string;
    x: number;
    y: number;
  }>;
  onWindowClick: (winId: string) => void;
  onIconClick: (icon: any) => void;
}
```

## Desktop Mode

In desktop mode, the shell renders:
- Desktop with wallpaper and icons
- Floating windows
- Taskbar at bottom

## Mobile Mode

In mobile mode, the shell renders:
- Desktop icons as home screen
- Full-screen app cards
- App switcher (replaces taskbar)

## Integration

The shell integrates:
- **@browser-os/windowing**: Window management
- **@browser-os/taskbar**: Taskbar and app switcher
- **@browser-os/desktop**: Desktop components
- **@browser-os/theme**: Theme system

## Gestures (Mobile)

Mobile mode supports gestures:
- Swipe up: Open app switcher
- Swipe left/right: Navigate home screen pages
- Long press: Icon reorder mode

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

