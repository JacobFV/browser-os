# App Development Guide

Complete guide to building applications for Browser OS.

## Table of Contents

- [App Structure](#app-structure)
- [Creating Your First App](#creating-your-first-app)
- [App Registration](#app-registration)
- [Building with React](#building-with-react)
- [State Management](#state-management)
- [Styling](#styling)
- [Publishing Apps](#publishing-apps)
- [Advanced Topics](#advanced-topics)

## App Structure

### Basic App Format

Every Browser OS app is a JavaScript module that exports a default async function:

```javascript
export default async function main(os) {
  // Your app code here
  // os is the OSAPI object
}
```

### App Entry Point

Apps are stored in `/bin/<app-id>.js` and executed as processes. The `main` function receives the `os` API object.

## Creating Your First App

### Step 1: Create App File

Create your app file in the filesystem at `/bin/my-app.js`:

```javascript
export default async function main(os) {
  // Create window
  const window = await os.window.create({
    title: 'My App',
    width: 800,
    height: 600,
    workspaceId: 'workspace-1'
  });
  
  // Create UI
  const container = document.createElement('div');
  container.innerHTML = '<h1>Hello, Browser OS!</h1>';
  
  // Append to window (simplified - see React section for better approach)
  // In practice, you'd use React or another framework
}
```

### Step 2: Register App

Add your app to `/etc/registry.json`:

```json
{
  "my-app": {
    "id": "my-app",
    "name": "My App",
    "version": "1.0.0",
    "description": "My first Browser OS app",
    "icon": "📱",
    "executable": "/bin/my-app.js",
    "enabled": true,
    "showInTaskbar": true
  }
}
```

### Step 3: Launch App

Launch from terminal:
```bash
spawn my-app
```

Or programmatically:
```javascript
await os.syscall('proc.spawn', {
  appId: 'my-app',
  args: [],
  options: {}
});
```

## Building with React

### React App Template

```javascript
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export default async function main(os) {
  // Create window
  const window = await os.window.create({
    title: 'My React App',
    width: 800,
    height: 600,
    workspaceId: 'workspace-1'
  });
  
  // Wait for window to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Find window container
  const windowElement = document.querySelector(`[data-window-id="${window.id}"]`);
  const content = windowElement?.querySelector('.window-content');
  
  if (!content) {
    throw new Error('Window content not found');
  }
  
  // Render React app
  const root = createRoot(content);
  root.render(<App os={os} window={window} />);
  
  // Cleanup on window close
  window.onclose = () => {
    root.unmount();
  };
}

function App({ os, window }) {
  const [count, setCount] = useState(0);
  
  const handleClick = async () => {
    setCount(count + 1);
    await os.audio.beep(440, 100);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>My React App</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### Using React Hooks with OS APIs

```javascript
import { useState, useEffect } from 'react';

function LocationDisplay({ os }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function getLocation() {
      try {
        const pos = await os.location.getCurrentPosition();
        setPosition(pos);
      } catch (err) {
        setError(err.message);
      }
    }
    
    getLocation();
  }, [os]);
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!position) {
    return <div>Loading location...</div>;
  }
  
  return (
    <div>
      <p>Latitude: {position.latitude}</p>
      <p>Longitude: {position.longitude}</p>
      <p>Accuracy: {position.accuracy}m</p>
    </div>
  );
}
```

## State Management

### Using Storage

```javascript
function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = os.storage.getJSON(key);
      return item ?? initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = async (value) => {
    try {
      setStoredValue(value);
      await os.storage.setJSON(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };
  
  return [storedValue, setValue];
}

// Usage
function MyComponent({ os }) {
  const [settings, setSettings] = useStorage('settings', {
    theme: 'light',
    fontSize: 14
  });
  
  return (
    <div>
      <button onClick={() => setSettings({ ...settings, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Using Context for OS API

```javascript
import { createContext, useContext } from 'react';

const OSContext = createContext(null);

export function OSProvider({ os, children }) {
  return (
    <OSContext.Provider value={os}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const os = useContext(OSContext);
  if (!os) {
    throw new Error('useOS must be used within OSProvider');
  }
  return os;
}

// Usage in app
export default async function main(os) {
  const window = await os.window.create({ /* ... */ });
  const content = getWindowContent(window.id);
  const root = createRoot(content);
  
  root.render(
    <OSProvider os={os}>
      <App window={window} />
    </OSProvider>
  );
}

function App({ window }) {
  const os = useOS(); // Access OS API anywhere
  
  return (
    <div>
      <MyComponent />
    </div>
  );
}
```

## Styling

### Inline Styles

```javascript
const containerStyle = {
  padding: '20px',
  fontFamily: 'system-ui, sans-serif',
  backgroundColor: '#f5f5f5'
};

<div style={containerStyle}>
  <h1>My App</h1>
</div>
```

### CSS Modules

```javascript
// styles.module.css
.container {
  padding: 20px;
  font-family: system-ui, sans-serif;
}

.title {
  font-size: 24px;
  color: #333;
}

// Component
import styles from './styles.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>My App</h1>
</div>
```

### Global Styles

```javascript
// Inject global styles
const style = document.createElement('style');
style.textContent = `
  .my-app {
    font-family: system-ui, sans-serif;
  }
  
  .my-app button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
```

## Publishing Apps

### App Manifest

Create a comprehensive app manifest:

```json
{
  "id": "my-app",
  "name": "My App",
  "version": "1.0.0",
  "description": "A great app for Browser OS",
  "author": "Your Name",
  "icon": "📱",
  "executable": "/bin/my-app.js",
  "enabled": true,
  "showInTaskbar": true,
  "category": "productivity",
  "permissions": [
    "window.create",
    "clipboard.read",
    "clipboard.write",
    "storage.localStorage"
  ]
}
```

### App Icon

Icons can be:
- Emoji (simple): `"icon": "📱"`
- Image URL: `"icon": "https://example.com/icon.png"`
- Data URL: `"icon": "data:image/png;base64,..."`

### Permissions

List required permissions in manifest:

```json
{
  "permissions": [
    "window.create",
    "clipboard.read",
    "clipboard.write",
    "audio.play",
    "media.getUserMedia",
    "location.getCurrentPosition"
  ]
}
```

## Advanced Topics

### Inter-Process Communication

```javascript
// App 1: Send message
await os.channel.send('app-channel', {
  type: 'MESSAGE',
  data: 'Hello from App 1'
});

// App 2: Receive message
os.channel.on('app-channel', (message) => {
  console.log('Received:', message);
});
```

### File Operations

```javascript
// Read file
const content = await os.syscall('fs.read', {
  path: '/home/user/document.txt'
});

// Write file
await os.syscall('fs.write', {
  path: '/home/user/document.txt',
  data: 'New content'
});

// List directory
const files = await os.syscall('fs.readdir', {
  path: '/home/user'
});
```

### Spawning Child Processes

```javascript
// Spawn another app via syscall
const result = await os.syscall('proc.spawn', {
  appId: 'helper-app',
  args: ['arg1', 'arg2'],
  options: {
    cwd: '/home/user',
    env: { CUSTOM_VAR: 'value' }
  }
});

// Monitor process
const proc = await os.process.get(result.pid);
console.log('Process status:', proc.status);

// Kill process
await os.syscall('proc.kill', {
  pid: result.pid,
  signal: 'SIGTERM'
});
```

### Error Boundaries (React)

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Performance Optimization

```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering
  return <div>{/* ... */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

## Testing Your App

### Unit Tests

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders correctly', () => {
    const mockOS = {
      window: { create: jest.fn() },
      clipboard: { readText: jest.fn() }
    };
    
    render(<App os={mockOS} />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
describe('App Integration', () => {
  it('creates window on startup', async () => {
    const mockOS = {
      window: {
        create: jest.fn().mockResolvedValue({ id: 'window-1' })
      }
    };
    
    await main(mockOS);
    expect(mockOS.window.create).toHaveBeenCalled();
  });
});
```

## Best Practices Summary

1. **Use React** for complex UIs
2. **Handle errors** gracefully
3. **Clean up resources** on window close
4. **Request permissions** appropriately
5. **Test thoroughly** before publishing
6. **Document your app** with clear descriptions
7. **Follow security** best practices
8. **Optimize performance** for better UX

## Next Steps

- Read the [API Usage Guide](./API_USAGE.md) for detailed API examples
- Check [Best Practices](./BEST_PRACTICES.md) for recommended patterns
- Explore existing system apps for reference implementations
- Join the community for support and feedback

Happy app building! 🚀

