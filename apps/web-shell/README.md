# @browser-os/web-shell

The main web shell application for browser-os - a complete OS interface running in the browser.

## Features

- Desktop and mobile shells
- Window management
- App launching and management
- Runtime theme switching
- Command palette (Cmd/Ctrl+K)
- Global shortcuts (Alt+Tab, Win key, etc.)

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm --filter @browser-os/web-shell dev

# Build for production
pnpm --filter @browser-os/web-shell build
```

The app will be available at `http://localhost:3000` (or the port Vite assigns).

## Keyboard Shortcuts

- **Cmd/Ctrl+K**: Open command palette
- **Alt+Tab**: Cycle through windows
- **Win/Meta**: Open start menu (desktop mode)
- **Escape**: Close dialogs/menus

## Architecture

web-shell integrates:
- `@browser-os/shell`: Desktop/mobile shell composition
- `@browser-os/windowing`: Window management
- `@browser-os/process`: Process management
- `@browser-os/fs`: Virtual filesystem
- `@browser-os/theme`: Theme system

