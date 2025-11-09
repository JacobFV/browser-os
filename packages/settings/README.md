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

### User Preferences

```typescript
import { settingsStore } from '@browser-os/settings';

// Get user preferences
const prefs = settingsStore.getUserPreferences();

// Set preference
settingsStore.setUserPreference('theme', 'macos');
settingsStore.setUserPreference('language', 'en');

// Get preference
const theme = settingsStore.getUserPreference('theme');
```

### Workspace Settings

```typescript
import { settingsStore } from '@browser-os/settings';

// Get workspace settings
const settings = settingsStore.getWorkspaceSettings('workspace-1');

// Set workspace settings
settingsStore.setWorkspaceSettings('workspace-1', {
  name: 'Development',
  layout: { /* ... */ },
  theme: 'monaco',
});
```

### System Preferences

```typescript
import { settingsStore } from '@browser-os/settings';

// Get system preferences
const sysPrefs = settingsStore.getSystemPreferences();

// Set system preference
settingsStore.setSystemPreference('telemetry', true);
settingsStore.setSystemPreference('autoUpdate', false);
```

## Interfaces

### UserPreferences

```typescript
interface UserPreferences {
  theme?: string;
  language?: string;
  [key: string]: any;
}
```

### WorkspaceSettings

```typescript
interface WorkspaceSettings {
  name: string;
  layout?: unknown;
  [key: string]: any;
}
```

### SystemPreferences

```typescript
interface SystemPreferences {
  [key: string]: any;
}
```

## Persistence

Settings are automatically persisted to localStorage:
- `browser-os-user-prefs`: User preferences
- `browser-os-workspace-settings`: Workspace settings
- `browser-os-system-prefs`: System preferences

## Loading Settings

Settings are loaded automatically on initialization:

```typescript
import { settingsStore } from '@browser-os/settings';

// Settings are already loaded
const theme = settingsStore.getUserPreference('theme');
```

## React Integration

```typescript
import { useEffect, useState } from 'react';
import { settingsStore } from '@browser-os/settings';

function SettingsPanel() {
  const [theme, setTheme] = useState(
    settingsStore.getUserPreference('theme') || 'win95'
  );
  
  useEffect(() => {
    settingsStore.setUserPreference('theme', theme);
  }, [theme]);
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="win95">Windows 95</option>
      <option value="macos">macOS</option>
      <option value="monaco">Monaco</option>
      <option value="glass">Glass</option>
    </select>
  );
}
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

