# @browser-os/taskbar

Taskbar and app switcher components for browser-os.

## Installation

```bash
pnpm add @browser-os/taskbar
```

## Features

- **Taskbar**: Desktop mode taskbar with window buttons
- **App Switcher**: Mobile mode app grid switcher
- **Window Previews**: Thumbnail previews (future)
- **System Tray**: System tray integration (future)

## Usage

### Taskbar (Desktop Mode)

```typescript
import { Taskbar } from '@browser-os/taskbar';

function DesktopShell() {
  const windows = [
    { id: 'win-1', title: 'Files', appId: 'files' },
    { id: 'win-2', title: 'Terminal', appId: 'terminal' },
  ];
  
  return (
    <Taskbar
      windows={windows}
      onWindowClick={(winId) => {
        // Focus window
        windowManager.focusWindow(winId);
      }}
    />
  );
}
```

### App Switcher (Mobile Mode)

```typescript
import { AppSwitcher } from '@browser-os/taskbar';

function MobileShell() {
  const apps = [
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
  ];
  
  return (
    <AppSwitcher
      apps={apps}
      onAppSelect={(appId) => {
        // Launch or switch to app
        openWindow({ appId, title: appId });
      }}
    />
  );
}
```

## Components

### Taskbar Props

```typescript
interface TaskbarProps {
  windows: Array<{
    id: string;
    title: string;
    appId: string;
  }>;
  onWindowClick: (winId: string) => void;
}
```

### AppSwitcher Props

```typescript
interface AppSwitcherProps {
  apps: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  onAppSelect: (appId: string) => void;
}
```

## Styling

Components use theme tokens:

```css
.taskbar {
  background: var(--os-bg);
  border-top: 1px solid var(--os-border);
}

.taskbar-item {
  color: var(--os-fg);
  border-radius: var(--os-radius);
}

.app-switcher {
  background: var(--os-bg);
}
```

## Integration

The taskbar integrates with:
- **@browser-os/windowing**: Window management
- **@browser-os/theme**: Theme system
- **@browser-os/process**: Process information

## Future Features

- Window thumbnails/previews
- System tray icons
- Notification badges
- App grouping
- Recent apps list

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

