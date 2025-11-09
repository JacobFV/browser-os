# @browser-os/net

Network abstraction layer for browser-os - fetch, WebSocket, and SSE.

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

const response = await fetch('https://api.example.com/data', {
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});
const data = await response.json();
```

### WebSocket Client

```typescript
import { WebSocketClient } from '@browser-os/net';

const ws = new WebSocketClient('wss://api.example.com/ws');
await ws.connect();
ws.send('message', { data: 'hello' });
ws.on('message', (data) => console.log('Received:', data));
ws.close();
```

### SSE Client

```typescript
import { SSEClient } from '@browser-os/net';

const sse = new SSEClient();
sse.connect('https://api.example.com/events');
sse.on('update', (data) => console.log('Update:', data));
sse.close();
```

## Capability Requirements

Network operations require capabilities:

```typescript
import { appHost } from '@browser-os/app-host';

if (!appHost.checkCapability(appId, 'net.fetch')) {
  throw new Error('Permission denied: net.fetch');
}
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

