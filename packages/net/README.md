# @browser-os/net

Network abstraction layer for browser-os - fetch, WebSocket, SSE, and RTC.

## Installation

```bash
pnpm add @browser-os/net
```

## Features

- **Fetch Wrapper**: Enhanced fetch with timeout support
- **WebSocket Client**: Typed WebSocket wrapper
- **SSE Client**: Server-Sent Events client
- **RTC Abstraction**: WebRTC utilities (future)

## Usage

### Fetch

```typescript
import { fetch } from '@browser-os/net';

// Basic fetch with timeout
const response = await fetch('https://api.example.com/data', {
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### WebSocket Client

```typescript
import { WebSocketClient } from '@browser-os/net';

// Create WebSocket client
const ws = new WebSocketClient('wss://api.example.com/ws');

// Connect
await ws.connect();

// Send message
ws.send('message', { data: 'hello' });

// Listen for messages
ws.on('message', (data) => {
  console.log('Received:', data);
});

// Close connection
ws.close();
```

### SSE Client

```typescript
import { SSEClient } from '@browser-os/net';

// Create SSE client
const sse = new SSEClient();

// Connect
sse.connect('https://api.example.com/events');

// Listen for events
sse.on('update', (data) => {
  console.log('Update:', data);
});

sse.on('notification', (data) => {
  console.log('Notification:', data);
});

// Close
sse.close();
```

## Fetch Options

```typescript
interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
}
```

## WebSocket Client API

```typescript
class WebSocketClient {
  constructor(url: string);
  connect(): Promise<void>;
  send(type: string, payload: any): void;
  on(type: string, handler: (data: any) => void): void;
  close(): void;
}
```

## SSE Client API

```typescript
class SSEClient {
  connect(url: string): void;
  on(type: string, handler: (data: any) => void): void;
  close(): void;
}
```

## Error Handling

```typescript
import { fetch } from '@browser-os/net';

try {
  const response = await fetch('https://api.example.com/data', {
    timeout: 5000,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else {
    console.error('Request failed:', error);
  }
}
```

## Integration with Capabilities

Network operations require capabilities:

```typescript
import { appHost } from '@browser-os/app-host';

function makeRequest(appId: string, url: string) {
  if (!appHost.checkCapability(appId, 'net.fetch')) {
    throw new Error('Permission denied: net.fetch');
  }
  
  return fetch(url);
}
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

