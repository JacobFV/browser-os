import { ChessClient } from './ChessClient';

export interface MatchmakingOptions {
  serverUrl: string;
  playerId: string;
  playerName?: string;
}

export class Matchmaking {
  private client: ChessClient;
  private onGameFound?: (gameId: string, color: 'w' | 'b') => void;
  private onError?: (error: string) => void;

  constructor(options: MatchmakingOptions) {
    this.client = new ChessClient({
      serverUrl: options.serverUrl,
      playerId: options.playerId,
      playerName: options.playerName,
    });

    this.client.setCallbacks({
      onJoined: (gameId, color) => {
        if (this.onGameFound) {
          this.onGameFound(gameId, color);
        }
      },
      onError: (error) => {
        if (this.onError) {
          this.onError(error);
        }
      },
    });
  }

  /**
   * Find or create a game
   */
  async findGame(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.client.isConnected()) {
        this.client.connect().then(() => {
          this.client.joinGame();
        }).catch(reject);
      } else {
        this.client.joinGame();
      }

      this.onGameFound = (gameId) => {
        resolve(gameId);
      };

      this.onError = (error) => {
        reject(new Error(error));
      };
    });
  }

  /**
   * Join a specific game
   */
  async joinGame(gameId: string): Promise<void> {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
    this.client.joinGame(gameId);
  }

  /**
   * Get the chess client
   */
  getClient(): ChessClient {
    return this.client;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.client.disconnect();
  }
}

