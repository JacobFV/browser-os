import { WebSocket } from 'ws';
import { TelemetryService } from './TelemetryService';
import { ServiceRegistry } from './ServiceRegistry';
import type { WebSocketMessage, ClientMetadata, TelemetryData } from './types';

export interface WebSocketHandlerOptions {
  telemetryService: TelemetryService;
  serviceRegistry: ServiceRegistry;
  pingInterval?: number;
}

/**
 * Handles WebSocket connections and messages
 */
export class WebSocketHandler {
  private clients: Map<string, WebSocket> = new Map();
  private wsToClientId: Map<WebSocket, string> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private options: WebSocketHandlerOptions) {}

  /**
   * Handle a new WebSocket connection
   */
  handleConnection(ws: WebSocket): void {
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('[WebSocketHandler] Failed to parse message:', error);
      }
    });

    ws.on('close', () => {
      const clientId = this.wsToClientId.get(ws);
      if (clientId) {
        this.clients.delete(clientId);
        this.wsToClientId.delete(ws);
        this.options.telemetryService.unregisterClient(clientId);
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocketHandler] WebSocket error:', error);
      const clientId = this.wsToClientId.get(ws);
      if (clientId) {
        this.clients.delete(clientId);
        this.wsToClientId.delete(ws);
        this.options.telemetryService.unregisterClient(clientId);
      }
    });
  }

  /**
   * Start ping interval to keep connections alive
   */
  startPingInterval(): void {
    const interval = this.options.pingInterval ?? 30000;
    this.pingInterval = setInterval(() => {
      this.clients.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
          this.send(ws, 'server:ping');
          this.options.telemetryService.updateClientLastSeen(clientId);
        } else {
          // Remove dead connections
          this.clients.delete(clientId);
          this.options.telemetryService.unregisterClient(clientId);
        }
      });
    }, interval);
  }

  /**
   * Stop ping interval
   */
  stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send message to a specific client
   */
  sendToClient(clientId: string, type: string, payload?: unknown): void {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, type, payload);
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(type: string, payload?: unknown): void {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.send(ws, type, payload);
      }
    });
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'client:connect':
        this.handleConnect(ws, message.payload as ClientMetadata);
        break;

      case 'client:telemetry':
        this.handleTelemetry(ws, message.payload as TelemetryData);
        break;

      case 'client:pong':
        // Client responded to ping, connection is alive
        break;

      default:
        console.warn('[WebSocketHandler] Unknown message type:', message.type);
    }
  }

  private handleConnect(ws: WebSocket, metadata: ClientMetadata): void {
    const clientId = metadata.clientId;
    this.clients.set(clientId, ws);
    this.wsToClientId.set(ws, clientId);
    this.options.telemetryService.registerClient(clientId, metadata);

    // Send available services to client
    const services = this.options.serviceRegistry.getEnabled();
    this.send(ws, 'server:service:register', services);

    console.log(`[WebSocketHandler] Client connected: ${clientId}`);
  }

  private handleTelemetry(ws: WebSocket, data: TelemetryData): void {
    const clientId = this.wsToClientId.get(ws);
    if (!clientId) {
      console.warn('[WebSocketHandler] Received telemetry from unknown client');
      return;
    }

    this.options.telemetryService.storeTelemetry(clientId, data);
  }

  private send(ws: WebSocket, type: string, payload?: unknown): void {
    const message: WebSocketMessage = { type, payload };
    ws.send(JSON.stringify(message));
  }
}

