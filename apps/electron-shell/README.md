# Electron Shell

Electron wrapper for browser-os web-shell.

## Features

- Native desktop application wrapper
- Native file system access
- System integrations
- Desktop app distribution

## Development

```bash
# Start web-shell dev server
pnpm --filter @browser-os/web-shell dev

# In another terminal, run electron shell
pnpm --filter @browser-os/electron-shell dev
```

## Building

```bash
# Build web-shell first
pnpm --filter @browser-os/web-shell build

# Build electron app
pnpm --filter @browser-os/electron-shell build
```

Outputs platform-specific installers in `dist/`.

