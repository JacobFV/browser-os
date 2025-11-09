# @browser-os/theme

Theme tokens and skin presets for browser-os.

## Installation

```bash
pnpm add @browser-os/theme
```

## Features

- **Theme Tokens**: CSS variables for consistent theming
- **Skin Presets**: Win95, macOS, Monaco, Glass themes
- **Runtime Switching**: Change themes at runtime
- **Per-Workspace Themes**: Save theme preferences per workspace

## Usage

### Applying a Theme

```typescript
import { applyTheme } from '@browser-os/theme';

// Apply Win95 theme
applyTheme('win95');

// Apply macOS theme with custom accent
applyTheme('macos', '#0071e3');

// Apply Monaco theme
applyTheme('monaco');

// Apply Glass theme
applyTheme('glass');
```

### Getting Current Theme

```typescript
import { getTheme } from '@browser-os/theme';

const currentTheme = getTheme(); // 'win95' | 'macos' | 'monaco' | 'glass'
```

### Theme Tokens

Access theme tokens in CSS:

```css
.my-component {
  background-color: var(--os-bg);
  color: var(--os-fg);
  border: 1px solid var(--os-border);
  border-radius: var(--os-radius);
  box-shadow: var(--os-shadow);
}
```

### Available Tokens

- `--os-bg`: Background color
- `--os-fg`: Foreground/text color
- `--os-muted`: Muted/secondary text color
- `--os-accent`: Accent color
- `--os-border`: Border color
- `--os-radius`: Border radius
- `--os-elevation`: Elevation style
- `--os-shadow`: Box shadow

## Skins

### Win95

Classic Windows 95 aesthetic:
- Pixel borders
- Titlebar gradients
- Inset shadows
- No border radius

### macOS

Modern macOS design:
- Translucent backgrounds
- Rounded corners
- Blur effects
- Subtle shadows

### Monaco

VS Code-inspired dark theme:
- Dark background
- Editor-serious look
- Flat design
- High contrast

### Glass

Glassmorphism effects:
- Translucent backgrounds
- Backdrop blur
- Rounded corners
- Layered shadows

## Custom Themes

Create custom theme tokens:

```typescript
import { ThemeTokens } from '@browser-os/theme';

const customTokens: ThemeTokens = {
  bg: '#ffffff',
  fg: '#000000',
  muted: '#666666',
  accent: '#007acc',
  border: '#e0e0e0',
  radius: '8px',
  elevation: 'blur',
  shadow: '0 2px 8px rgba(0,0,0,0.1)',
};
```

## React Integration

```typescript
import { useEffect } from 'react';
import { applyTheme, getTheme } from '@browser-os/theme';

function App() {
  useEffect(() => {
    // Apply theme on mount
    applyTheme('win95');
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const theme = getTheme();
      console.log('Theme changed to:', theme);
    };
    
    // ... setup listener
    
    return () => {
      // Cleanup
    };
  }, []);
}
```

## Per-Workspace Themes

Themes can be saved per workspace:

```typescript
import { workspaceManager } from '@browser-os/workspace';

const workspace = workspaceManager.getCurrentWorkspace();
workspace.theme = {
  skin: 'macos',
  accent: '#0071e3',
};

workspaceManager.saveWorkspace(workspace);
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

