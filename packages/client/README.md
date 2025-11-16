# @browser-os/client

Client package for connecting browser-os to a remote server.

## Overview

The client package provides functionality to connect a browser-os instance to a remote server, enabling services like telemetry collection, server-mounted VFS, internet proxying, and more.

## Features

- WebSocket connection management with automatic reconnection
- Telemetry collection from system events
- Service registry for managing available services
- Event bridge to forward system events to server

## Usage

```typescript
import { Client } from '@browser-os/client';
import { EventBus } from '@browser-os/events';
import { Kernel } from '@browser-os/kernel';

// Initialize kernel and event bus
const eventBus = new EventBus();
const kernel = new Kernel({ eventBus });
await kernel.init();

// Create client
const client = new Client(eventBus, kernel, {
  serverUrl: 'ws://localhost:3000',
  reconnectInterval: 3000,
  telemetryInterval: 5000,
});

// Connect to server
await client.connect();

// Register services (future)
client.registerService({
  name: 'vfs',
  version: '1.0.0',
  enabled: true,
});

// Disconnect when done
client.disconnect();
```

## API

### Client

Main client class for managing server connection.

#### Constructor

```typescript
new Client(eventBus: EventBus, kernel: Kernel, options: ClientOptions)
```

#### Methods

- `connect(): Promise<void>` - Connect to server
- `disconnect(): void` - Disconnect from server
- `isConnected(): boolean` - Check connection status
- `getConnectionState(): string` - Get current connection state
- `registerService(service: ServiceDefinition): void` - Register a service
- `getServiceRegistry(): ServiceRegistry` - Get service registry
- `getConnectionManager(): ConnectionManager` - Get connection manager

### ConnectionManager

Manages WebSocket connection lifecycle.

- `connect(): Promise<void>` - Connect to server
- `disconnect(): void` - Disconnect from server
- `send(type: string, payload?: unknown): void` - Send message
- `onMessage(handler: MessageHandler): () => void` - Register message handler
- `isConnected(): boolean` - Check if connected
- `getState(): ConnectionState` - Get connection state

### TelemetryCollector

Collects telemetry data from system events.

- `start(): void` - Start collecting telemetry
- `stop(): void` - Stop collecting telemetry
- `collect(): Promise<TelemetryData>` - Collect current snapshot

### ServiceRegistry

Manages available services.

- `register(service: ServiceDefinition): void` - Register service
- `unregister(name: string): void` - Unregister service
- `get(name: string): ServiceDefinition | undefined` - Get service
- `getAll(): ServiceDefinition[]` - Get all services
- `getEnabled(): ServiceDefinition[]` - Get enabled services

## Telemetry

The client automatically collects telemetry data including:

- Process count
- Memory usage (if available via performance.memory)
- Active window count
- System events (process and windowing events)

Telemetry is sent to the server at regular intervals (default: 5 seconds).

## Communication Protocol

### Client Messages

- `client:connect` - Initial connection with metadata
- `client:telemetry` - Telemetry data
- `client:pong` - Response to server ping

### Server Messages

- `server:ping` - Keepalive ping
- `server:service:register` - Available services

## Future Services

The client is designed to support future services:

- Server-mounted VFS
- Internet proxying
- Remote app execution
- System monitoring

