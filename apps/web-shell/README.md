# @browser-os/web-shell

The main web shell application for browser-os - a complete OS interface running in the browser.

## Overview

web-shell is the primary application that integrates all browser-os packages into a cohesive operating system experience. It provides both desktop and mobile modes, window management, app launching, and system services.

## Features

- **Desktop Shell**: Full windowing system with taskbar and desktop
- **Mobile Shell**: Full-screen app cards with app switcher
- **App Management**: Launch and manage system and user apps
- **Theme System**: Runtime theme switching
- **Command Palette**: Quick app launch and system actions (Cmd/Ctrl+K)
- **Global Shortcuts**: Alt+Tab, Win key, etc.
- **Mobile Gestures**: Swipe gestures for app switching

## Development

### Running Locally

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm --filter @browser-os/web-shell dev

# Build for production
pnpm --filter @browser-os/web-shell build
```

The app will be available at `http://localhost:3000`

### Building

```bash
pnpm --filter @browser-os/web-shell build
```

Output will be in `apps/web-shell/dist/`

## Usage

### Desktop Mode

- Click desktop icons to launch apps
- Drag windows to move them
- Resize windows by dragging edges
- Use taskbar to switch between apps
- Right-click desktop for context menu

### Mobile Mode

- Swipe up from bottom to open app switcher
- Swipe left/right to navigate home screen pages
- Tap apps to launch full-screen
- Long-press icons to reorder/uninstall

### Keyboard Shortcuts

- **Cmd/Ctrl+K**: Open command palette
- **Alt+Tab**: Cycle through windows
- **Win/Meta**: Open start menu (desktop mode)
- **Escape**: Close dialogs/menus

### Command Palette

Press `Cmd/Ctrl+K` to open the command palette. You can:
- Search for apps by name
- Run system commands
- Switch workspaces
- Toggle settings

## Architecture

web-shell integrates:

- **@browser-os/shell**: Desktop/mobile shell composition
- **@browser-os/windowing**: Window management
- **@browser-os/process**: Process management
- **@browser-os/fs**: Virtual filesystem
- **@browser-os/theme**: Theme system
- **@browser-os/taskbar**: Taskbar components
- **@browser-os/desktop**: Desktop components

## Configuration

### Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3001
VITE_ENABLE_TELEMETRY=true
```

### Theme Configuration

Themes can be configured in `src/App.tsx`:

```typescript
import { applyTheme } from '@browser-os/theme';

// Apply theme on mount
useEffect(() => {
  applyTheme('win95'); // or 'macos', 'monaco', 'glass'
}, []);
```

## Customization

### Adding System Apps

System apps are registered in the app registry. To add a new app:

1. Create app in `system-apps/`
2. Register in app registry
3. Add desktop icon if needed

### Custom Themes

Create a new theme in `@browser-os/theme`:

```typescript
export const customTheme: ThemeTokens = {
  bg: '#ffffff',
  fg: '#000000',
  // ... other tokens
};
```

## Performance

### Optimization Tips

- Use React.memo for expensive components
- Lazy load app components
- Virtualize long lists
- Debounce window resize handlers

### Performance Targets

- Window open: < 200ms
- Shell TTI: < 2s
- Drag operations: 60fps

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Focus management
- Reduced motion support

## Troubleshooting

### Windows not opening

Check browser console for errors. Ensure apps are properly registered.

### Theme not applying

Verify theme package is built: `pnpm --filter @browser-os/theme build`

### Performance issues

- Check for memory leaks in app components
- Verify lazy loading is working
- Profile with browser DevTools

## API Reference

See individual package documentation:
- [@browser-os/shell](../packages/shell/README.md)
- [@browser-os/windowing](../packages/windowing/README.md)
- [@browser-os/process](../packages/process/README.md)

