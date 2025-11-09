# @browser-os/desktop

Desktop components for browser-os - wallpaper, desktop icons, and context menus.

## Installation

```bash
pnpm add @browser-os/desktop
```

## Features

- **Desktop**: Main desktop container with wallpaper
- **Desktop Icons**: Grid-based icon layout
- **Wallpaper**: Background image support
- **Context Menus**: Right-click context menus (future)

## Usage

### Desktop Component

```typescript
import { Desktop } from '@browser-os/desktop';

function DesktopShell() {
  const icons = [
    { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
    { id: '2', label: 'Terminal', icon: '💻', appId: 'terminal', x: 50, y: 150 },
  ];
  
  return (
    <Desktop
      wallpaper="url(/wallpaper.jpg)"
      icons={icons}
      onIconClick={(icon) => {
        // Launch app
        openWindow({ appId: icon.appId, title: icon.label });
      }}
      onIconDoubleClick={(icon) => {
        // Open app
        openWindow({ appId: icon.appId, title: icon.label });
      }}
    />
  );
}
```

### Wallpaper Component

```typescript
import { Wallpaper } from '@browser-os/desktop';

function DesktopShell() {
  return <Wallpaper src="/wallpaper.jpg" />;
}
```

## Components

### Desktop Props

```typescript
interface DesktopProps {
  wallpaper?: string;
  icons: DesktopIcon[];
  onIconClick: (icon: DesktopIcon) => void;
  onIconDoubleClick: (icon: DesktopIcon) => void;
}
```

### DesktopIcon Interface

```typescript
interface DesktopIcon {
  id: string;
  label: string;
  icon?: string;
  appId?: string;
  x: number;
  y: number;
}
```

## Icon Positioning

Icons are positioned absolutely:
- `x`, `y`: Pixel coordinates from top-left
- Grid alignment recommended (e.g., multiples of 80px)

## Mobile Mode

In mobile mode, desktop icons become home screen icons:
- Grid layout with pages
- Long-press to reorder
- Swipe between pages
- Folder support (future)

## Styling

```css
.desktop {
  background: var(--os-bg);
  background-image: var(--wallpaper);
  background-size: cover;
}

.desktop-icon {
  color: var(--os-fg);
  border-radius: var(--os-radius);
}

.desktop-icon:hover {
  background: var(--os-muted);
}
```

## Future Features

- Context menus (right-click)
- Icon drag-and-drop
- Folder creation
- Icon labels with text wrapping
- Icon selection (multi-select)
- Desktop shortcuts

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

