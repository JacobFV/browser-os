export interface TelemetryMetrics {
  processCount: number;
  memoryUsage: number;
  activeWindows: number;
}

export interface TelemetryEvent {
  type: string;
  timestamp: number;
  data: unknown;
}

export interface TelemetryData {
  timestamp: number;
  metrics: TelemetryMetrics;
  events: TelemetryEvent[];
}

export interface ClientMetadata {
  clientId: string;
  userAgent: string;
  timestamp: number;
}

export interface ServiceDefinition {
  name: string;
  version: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

export interface ConnectedClient {
  clientId: string;
  connectedAt: number;
  lastSeen: number;
  metadata?: ClientMetadata;
}

export interface ServerOptions {
  port?: number;
  host?: string;
  pingInterval?: number;
}

export interface WebSocketMessage {
  type: string;
  payload?: unknown;
}

