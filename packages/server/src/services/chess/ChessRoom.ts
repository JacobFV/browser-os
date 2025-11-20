import { Chess, type Square } from 'chess.js';
import type { WebSocket } from 'ws';

export interface Player {
  id: string;
  ws: WebSocket;
  color: 'w' | 'b';
  name?: string;
}

export interface ChessRoomOptions {
  gameId: string;
  whitePlayer: Player;
  blackPlayer?: Player;
}

export class ChessRoom {
  private gameId: string;
  private chess: Chess;
  private whitePlayer: Player;
  private blackPlayer: Player | null;
  private currentTurn: 'w' | 'b' = 'w';
  private status: 'waiting' | 'active' | 'finished' = 'waiting';
  private result: 'white' | 'black' | 'draw' | null = null;
  private moveHistory: string[] = [];
  private chatMessages: Array<{ sender: string; message: string; timestamp: number }> = [];

  constructor(options: ChessRoomOptions) {
    this.gameId = options.gameId;
    this.chess = new Chess();
    this.whitePlayer = options.whitePlayer;
    this.blackPlayer = options.blackPlayer || null;

    if (this.blackPlayer) {
      this.status = 'active';
    }

    this.setupPlayerHandlers(this.whitePlayer);
    if (this.blackPlayer) {
      this.setupPlayerHandlers(this.blackPlayer);
    }
  }

  private setupPlayerHandlers(player: Player): void {
    player.ws.on('close', () => {
      this.handlePlayerDisconnect(player);
    });

    player.ws.on('error', (error) => {
      console.error(`[ChessRoom] Error for player ${player.id}:`, error);
    });
  }

  /**
   * Add second player to room
   */
  addBlackPlayer(player: Player): void {
    if (this.blackPlayer) {
      throw new Error('Black player already assigned');
    }
    this.blackPlayer = player;
    this.status = 'active';
    this.setupPlayerHandlers(player);
    this.broadcast({
      type: 'chess:gameStarted',
      gameId: this.gameId,
    });
  }

  /**
   * Handle player move
   */
  handleMove(playerId: string, move: string): boolean {
    if (this.status !== 'active') {
      return false;
    }

    const player = this.getPlayerById(playerId);
    if (!player || player.color !== this.currentTurn) {
      return false;
    }

    try {
      // Parse move (format: "e2e4" or "e7e5")
      if (move.length < 4) {
        return false;
      }

      const from = move.substring(0, 2) as Square;
      const to = move.substring(2, 4) as Square;
      const promotion = move.length > 4 ? move.substring(4, 5) : undefined;

      const chessMove = this.chess.move({
        from,
        to,
        promotion: promotion as any,
      });

      if (!chessMove) {
        return false;
      }

      this.moveHistory.push(move);
      this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';

      // Check game status
      if (this.chess.isCheckmate()) {
        this.status = 'finished';
        this.result = this.currentTurn === 'w' ? 'black' : 'white';
      } else if (this.chess.isDraw() || this.chess.isStalemate()) {
        this.status = 'finished';
        this.result = 'draw';
      }

      // Broadcast move to both players
      this.broadcast({
        type: 'chess:move',
        gameId: this.gameId,
        move,
        fen: this.chess.fen(),
        status: this.status,
        result: this.result,
      });

      return true;
    } catch (error) {
      console.error('[ChessRoom] Invalid move:', error);
      return false;
    }
  }

  /**
   * Handle chat message
   */
  handleChat(playerId: string, message: string): void {
    const player = this.getPlayerById(playerId);
    if (!player) return;

    const chatMessage = {
      sender: player.name || playerId,
      message,
      timestamp: Date.now(),
    };

    this.chatMessages.push(chatMessage);

    this.broadcast({
      type: 'chess:chat',
      gameId: this.gameId,
      ...chatMessage,
    });
  }

  /**
   * Handle player resignation
   */
  handleResign(playerId: string): void {
    const player = this.getPlayerById(playerId);
    if (!player) return;

    this.status = 'finished';
    this.result = player.color === 'w' ? 'black' : 'white';

    this.broadcast({
      type: 'chess:gameOver',
      gameId: this.gameId,
      result: this.result,
      reason: 'resignation',
    });
  }

  /**
   * Handle player disconnect
   */
  private handlePlayerDisconnect(player: Player): void {
    if (this.status === 'active') {
      this.status = 'finished';
      this.result = player.color === 'w' ? 'black' : 'white';

      const otherPlayer = player.color === 'w' ? this.blackPlayer : this.whitePlayer;
      if (otherPlayer) {
        this.send(otherPlayer.ws, {
          type: 'chess:gameOver',
          gameId: this.gameId,
          result: this.result,
          reason: 'disconnection',
        });
      }
    }
  }

  /**
   * Get player by ID
   */
  private getPlayerById(playerId: string): Player | null {
    if (this.whitePlayer.id === playerId) return this.whitePlayer;
    if (this.blackPlayer?.id === playerId) return this.blackPlayer;
    return null;
  }

  /**
   * Send message to specific player
   */
  private send(ws: WebSocket, message: any): void {
    if (ws.readyState === 1) { // OPEN
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all players
   */
  private broadcast(message: any): void {
    this.send(this.whitePlayer.ws, message);
    if (this.blackPlayer) {
      this.send(this.blackPlayer.ws, message);
    }
  }

  /**
   * Get game state
   */
  getState() {
    return {
      gameId: this.gameId,
      fen: this.chess.fen(),
      status: this.status,
      result: this.result,
      currentTurn: this.currentTurn,
      moveHistory: this.moveHistory,
      whitePlayer: {
        id: this.whitePlayer.id,
        name: this.whitePlayer.name,
      },
      blackPlayer: this.blackPlayer ? {
        id: this.blackPlayer.id,
        name: this.blackPlayer.name,
      } : null,
    };
  }

  /**
   * Check if room is full
   */
  isFull(): boolean {
    return this.blackPlayer !== null;
  }

  /**
   * Check if player is in room
   */
  hasPlayer(playerId: string): boolean {
    return this.whitePlayer.id === playerId || this.blackPlayer?.id === playerId;
  }

  /**
   * Get game ID
   */
  getId(): string {
    return this.gameId;
  }
}

