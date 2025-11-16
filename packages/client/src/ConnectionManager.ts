import type { ClientOptions, ConnectionState } from './types';

export interface WebSocketMessage {
  type: string;
  payload?: unknown;
}

export type MessageHandler = (message: WebSocketMessage) => void;

/**
 * Manages WebSocket connection to server
 */
export class ConnectionManager {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private messageHandlers: Set<MessageHandler> = new Set();
  private options: Required<ClientOptions>;

  constructor(options: ClientOptions) {
    this.options = {
      reconnectInterval: options.reconnectInterval ?? 3000,
      reconnectMaxAttempts: options.reconnectMaxAttempts ?? Infinity,
      telemetryInterval: options.telemetryInterval ?? 5000,
      serverUrl: options.serverUrl,
    };
  }

  /**
   * Connect to server
   */
  connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.state = 'connecting';

      try {
        const ws = new WebSocket(this.options.serverUrl);
        this.ws = ws;

        ws.onopen = () => {
          this.state = 'connected';
          this.reconnectAttempts = 0;
          this.clearReconnectTimer();
          resolve();
        };

        ws.onerror = (error) => {
          if (this.state === 'connecting') {
            this.state = 'disconnected';
            reject(error);
          }
        };

        ws.onclose = () => {
          this.state = 'disconnected';
          this.ws = null;
          this.scheduleReconnect();
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[ConnectionManager] Failed to parse message:', error);
          }
        };
      } catch (error) {
        this.state = 'disconnected';
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state = 'disconnected';
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message to server
   */
  send(type: string, payload?: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: WebSocketMessage = { type, payload };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Register a message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('[ConnectionManager] Error in message handler:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.reconnectMaxAttempts) {
      console.warn('[ConnectionManager] Max reconnect attempts reached');
      return;
    }

    this.clearReconnectTimer();
    this.reconnectAttempts++;
    this.state = 'reconnecting';

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[ConnectionManager] Reconnect failed:', error);
      });
    }, this.options.reconnectInterval);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

