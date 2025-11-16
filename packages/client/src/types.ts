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

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface ClientOptions {
  serverUrl: string;
  reconnectInterval?: number;
  reconnectMaxAttempts?: number;
  telemetryInterval?: number;
}

