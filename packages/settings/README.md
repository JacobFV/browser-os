# @browser-os/settings

Settings store for browser-os - user preferences, workspace settings, and system preferences.

## Installation

```bash
pnpm add @browser-os/settings
```

## Features

- **User Preferences**: User-level settings
- **Workspace Settings**: Per-workspace configuration
- **System Preferences**: System-wide settings
- **Persistence**: Automatic localStorage persistence

## Usage

```typescript
import { settingsStore } from '@browser-os/settings';

// User preferences
settingsStore.setUserPreference('theme', 'macos');
const theme = settingsStore.getUserPreference('theme');

// Workspace settings
settingsStore.setWorkspaceSettings('workspace-1', {
  name: 'Development',
  layout: { /* ... */ },
  theme: 'monaco',
});

// System preferences
settingsStore.setSystemPreference('telemetry', true);
```

## Persistence

Settings are automatically persisted to localStorage:
- `browser-os-user-prefs`: User preferences
- `browser-os-workspace-settings`: Workspace settings
- `browser-os-system-prefs`: System preferences

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

