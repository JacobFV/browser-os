import type { Square } from 'chess.js';

export interface ChessClientOptions {
  serverUrl: string;
  playerId: string;
  playerName?: string;
}

export interface ChessClientCallbacks {
  onMove?: (move: string) => void;
  onChat?: (sender: string, message: string) => void;
  onGameOver?: (result: string) => void;
  onJoined?: (gameId: string, color: 'w' | 'b') => void;
  onError?: (error: string) => void;
}

export class ChessClient {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private playerId: string;
  private playerName?: string;
  private callbacks: ChessClientCallbacks = {};
  private gameId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(options: ChessClientOptions) {
    this.serverUrl = options.serverUrl;
    this.playerId = options.playerId;
    this.playerName = options.playerName;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: ChessClientCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Connect to server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(this.serverUrl);
        this.ws = ws;

        ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.clearReconnectTimeout();
          
          // Send connect message
          this.send({
            type: 'client:connect',
            payload: {
              clientId: this.playerId,
              name: this.playerName,
            },
          });
          
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[ChessClient] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[ChessClient] WebSocket error:', error);
          reject(error);
        };

        ws.onclose = () => {
          this.ws = null;
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Join a game
   */
  joinGame(gameId?: string): void {
    this.send({
      type: 'chess:join',
      payload: {
        gameId: gameId || undefined,
        playerId: this.playerId,
        name: this.playerName,
      },
    });
  }

  /**
   * Send a move
   */
  sendMove(from: Square, to: Square): void {
    if (!this.gameId) return;
    
    this.send({
      type: 'chess:move',
      payload: {
        gameId: this.gameId,
        move: `${from}${to}`,
      },
    });
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    if (!this.gameId) return;
    
    this.send({
      type: 'chess:chat',
      payload: {
        gameId: this.gameId,
        message,
      },
    });
  }

  /**
   * Resign from game
   */
  resign(): void {
    if (!this.gameId) return;
    
    this.send({
      type: 'chess:resign',
      payload: {
        gameId: this.gameId,
      },
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current game ID
   */
  getGameId(): string | null {
    return this.gameId;
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'chess:joined':
        this.gameId = message.payload?.gameId || null;
        if (this.callbacks.onJoined) {
          this.callbacks.onJoined(
            this.gameId!,
            message.payload?.color || 'w'
          );
        }
        break;

      case 'chess:move':
        if (this.callbacks.onMove) {
          this.callbacks.onMove(message.payload?.move);
        }
        break;

      case 'chess:chat':
        if (this.callbacks.onChat) {
          this.callbacks.onChat(
            message.payload?.sender || 'Unknown',
            message.payload?.message || ''
          );
        }
        break;

      case 'chess:gameOver':
        if (this.callbacks.onGameOver) {
          this.callbacks.onGameOver(message.payload?.result || 'draw');
        }
        break;

      case 'chess:error':
        if (this.callbacks.onError) {
          this.callbacks.onError(message.payload?.message || 'Unknown error');
        }
        break;

      case 'server:ping':
        // Respond to ping
        this.send({ type: 'client:pong' });
        break;
    }
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[ChessClient] Max reconnect attempts reached');
      return;
    }

    this.clearReconnectTimeout();
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`[ChessClient] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch((error) => {
        console.error('[ChessClient] Reconnect failed:', error);
      });
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

