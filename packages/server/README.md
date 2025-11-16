# @browser-os/server

Server package for providing remote services to browser-os clients.

## Overview

The server package provides a standalone Node.js server that clients can connect to for services like telemetry collection, server-mounted VFS, internet proxying, and more.

## Features

- WebSocket server for real-time client communication
- HTTP REST API for querying telemetry data
- Service registry for managing available services
- Client connection management
- Telemetry storage and querying

## Installation

```bash
pnpm install @browser-os/server
```

## Usage

### Programmatic Usage

```typescript
import { Server } from '@browser-os/server';

const server = new Server({
  port: 3000,
  host: '0.0.0.0',
  pingInterval: 30000,
});

await server.start();

// Register services (future)
server.getServiceRegistry().register({
  name: 'vfs',
  version: '1.0.0',
  enabled: true,
});

// Stop server
await server.stop();
```

### CLI Usage

```bash
# Start server with default settings
browser-os-server

# Start server on custom port
PORT=8080 browser-os-server

# Start server on custom host and port
HOST=127.0.0.1 PORT=8080 browser-os-server
```

## API

### Server

Main server class.

#### Constructor

```typescript
new Server(options?: ServerOptions)
```

Options:
- `port?: number` - Server port (default: 3000)
- `host?: string` - Server host (default: '0.0.0.0')
- `pingInterval?: number` - WebSocket ping interval in ms (default: 30000)

#### Methods

- `start(): Promise<void>` - Start the server
- `stop(): Promise<void>` - Stop the server
- `getTelemetryService(): TelemetryService` - Get telemetry service
- `getServiceRegistry(): ServiceRegistry` - Get service registry
- `getWebSocketHandler(): WebSocketHandler` - Get WebSocket handler

### TelemetryService

Manages telemetry data from clients.

- `storeTelemetry(clientId: string, data: TelemetryData): void` - Store telemetry
- `getTelemetryHistory(limit?: number): TelemetryData[]` - Get history
- `getTelemetryRange(startTime: number, endTime: number): TelemetryData[]` - Get range
- `getLatestTelemetry(): TelemetryData | null` - Get latest
- `getConnectedClients(): ConnectedClient[]` - Get connected clients
- `registerClient(clientId: string, metadata?: unknown): void` - Register client
- `unregisterClient(clientId: string): void` - Unregister client

### ServiceRegistry

Manages available services.

- `register(service: ServiceDefinition): void` - Register service
- `unregister(name: string): void` - Unregister service
- `get(name: string): ServiceDefinition | undefined` - Get service
- `getAll(): ServiceDefinition[]` - Get all services
- `getEnabled(): ServiceDefinition[]` - Get enabled services

## REST API

### Health Check

```
GET /health
```

Returns server status.

### Telemetry Endpoints

```
GET /telemetry/latest
```

Get latest telemetry data.

```
GET /telemetry/history?limit=100
```

Get telemetry history (optional limit).

```
GET /telemetry/range?startTime=1234567890&endTime=1234567900
```

Get telemetry for a time range.

```
GET /telemetry/clients
```

Get connected clients.

```
DELETE /telemetry/history
```

Clear telemetry history.

### Services Endpoint

```
GET /services
```

Get available services.

## WebSocket Protocol

### Server Messages

- `server:ping` - Keepalive ping
- `server:service:register` - Available services

### Client Messages

- `client:connect` - Client connection with metadata
- `client:telemetry` - Telemetry data
- `client:pong` - Response to ping

## Future Services

The server is designed to support future services:

- Server-mounted VFS
- Internet proxying
- Remote app execution
- System monitoring

## Development

```bash
# Build
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test
```

