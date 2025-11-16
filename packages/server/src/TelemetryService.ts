import type { TelemetryData, ConnectedClient } from './types';

/**
 * Service for handling telemetry data
 */
export class TelemetryService {
  private telemetryHistory: TelemetryData[] = [];
  private maxHistorySize = 1000;
  private clients: Map<string, ConnectedClient> = new Map();

  /**
   * Store telemetry data from a client
   */
  storeTelemetry(clientId: string, data: TelemetryData): void {
    // Update client last seen
    const client = this.clients.get(clientId);
    if (client) {
      client.lastSeen = Date.now();
    }

    // Store telemetry
    this.telemetryHistory.push(data);
    if (this.telemetryHistory.length > this.maxHistorySize) {
      this.telemetryHistory.shift();
    }
  }

  /**
   * Register a connected client
   */
  registerClient(clientId: string, metadata?: unknown): void {
    const client: ConnectedClient = {
      clientId,
      connectedAt: Date.now(),
      lastSeen: Date.now(),
      metadata: metadata as ConnectedClient['metadata'],
    };
    this.clients.set(clientId, client);
  }

  /**
   * Unregister a client
   */
  unregisterClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Update client last seen
   */
  updateClientLastSeen(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastSeen = Date.now();
    }
  }

  /**
   * Get telemetry history
   */
  getTelemetryHistory(limit?: number): TelemetryData[] {
    if (limit) {
      return this.telemetryHistory.slice(-limit);
    }
    return [...this.telemetryHistory];
  }

  /**
   * Get telemetry for a specific time range
   */
  getTelemetryRange(startTime: number, endTime: number): TelemetryData[] {
    return this.telemetryHistory.filter(
      (data) => data.timestamp >= startTime && data.timestamp <= endTime
    );
  }

  /**
   * Get latest telemetry
   */
  getLatestTelemetry(): TelemetryData | null {
    if (this.telemetryHistory.length === 0) {
      return null;
    }
    return this.telemetryHistory[this.telemetryHistory.length - 1];
  }

  /**
   * Get connected clients
   */
  getConnectedClients(): ConnectedClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): ConnectedClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Clear telemetry history
   */
  clearHistory(): void {
    this.telemetryHistory = [];
  }
}

