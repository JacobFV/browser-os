import { ChessRoom, type Player } from './ChessRoom';
import type { WebSocket } from 'ws';

export interface ChessServiceOptions {
  maxRooms?: number;
  roomTimeout?: number; // milliseconds
}

export class ChessService {
  private rooms: Map<string, ChessRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map(); // playerId -> gameId
  private options: Required<ChessServiceOptions>;
  private roomTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(options: ChessServiceOptions = {}) {
    this.options = {
      maxRooms: options.maxRooms ?? 100,
      roomTimeout: options.roomTimeout ?? 30 * 60 * 1000, // 30 minutes
    };
  }

  /**
   * Create a new game room
   */
  createRoom(player: Player): ChessRoom {
    if (this.rooms.size >= this.options.maxRooms) {
      throw new Error('Maximum number of rooms reached');
    }

    const gameId = this.generateGameId();
    const room = new ChessRoom({
      gameId,
      whitePlayer: player,
    });

    this.rooms.set(gameId, room);
    this.playerToRoom.set(player.id, gameId);

    // Set timeout to clean up empty rooms
    const timeout = setTimeout(() => {
      if (!room.isFull()) {
        this.removeRoom(gameId);
      }
    }, this.options.roomTimeout);

    this.roomTimeouts.set(gameId, timeout);

    return room;
  }

  /**
   * Join an existing room
   */
  joinRoom(gameId: string, player: Player): ChessRoom | null {
    const room = this.rooms.get(gameId);
    if (!room) {
      return null;
    }

    if (room.isFull()) {
      return null;
    }

    // Clear timeout since room is now full
    const timeout = this.roomTimeouts.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.roomTimeouts.delete(gameId);
    }

    room.addBlackPlayer(player);
    this.playerToRoom.set(player.id, gameId);

    return room;
  }

  /**
   * Find an available room to join
   */
  findAvailableRoom(): ChessRoom | null {
    for (const room of this.rooms.values()) {
      if (!room.isFull()) {
        return room;
      }
    }
    return null;
  }

  /**
   * Get room by game ID
   */
  getRoom(gameId: string): ChessRoom | undefined {
    return this.rooms.get(gameId);
  }

  /**
   * Get room by player ID
   */
  getRoomByPlayer(playerId: string): ChessRoom | null {
    const gameId = this.playerToRoom.get(playerId);
    if (!gameId) return null;
    return this.rooms.get(gameId) || null;
  }

  /**
   * Remove a room
   */
  removeRoom(gameId: string): void {
    const room = this.rooms.get(gameId);
    if (room) {
      // Remove player mappings
      const state = room.getState();
      this.playerToRoom.delete(state.whitePlayer.id);
      if (state.blackPlayer) {
        this.playerToRoom.delete(state.blackPlayer.id);
      }

      // Clear timeout
      const timeout = this.roomTimeouts.get(gameId);
      if (timeout) {
        clearTimeout(timeout);
        this.roomTimeouts.delete(gameId);
      }
    }

    this.rooms.delete(gameId);
  }

  /**
   * Handle player disconnect
   */
  handlePlayerDisconnect(playerId: string): void {
    const room = this.getRoomByPlayer(playerId);
    if (room) {
      // Room will handle the disconnect internally
      // Clean up after a delay
      setTimeout(() => {
        const currentRoom = this.getRoomByPlayer(playerId);
        if (!currentRoom) {
          this.removeRoom(room.getId());
        }
      }, 60000); // 1 minute delay
    }
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(): Array<{ gameId: string; players: number; status: string }> {
    return Array.from(this.rooms.values()).map((room) => {
      const state = room.getState();
      return {
        gameId: room.getId(),
        players: state.blackPlayer ? 2 : 1,
        status: state.status,
      };
    });
  }

  /**
   * Generate unique game ID
   */
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

