import type { ChessGameEngine, GameMetadata } from './ChessGameEngine';

export interface SavedGameState {
  fen: string;
  pgn: string;
  metadata: GameMetadata;
  moveHistory: string[];
  savedAt: number;
  gameMode: 'local' | 'ai' | 'online';
  gameId?: string;
}

export class GameState {
  private engine: ChessGameEngine;
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  constructor(engine: ChessGameEngine) {
    this.engine = engine;
  }

  /**
   * Save current game state for undo
   */
  saveState(): void {
    this.undoStack.push(this.engine.getFen());
    this.redoStack = []; // Clear redo stack when new move is made
  }

  /**
   * Undo move
   */
  undo(): boolean {
    const move = this.engine.undo();
    if (move && this.undoStack.length > 0) {
      const previousFen = this.undoStack.pop();
      if (previousFen) {
        this.redoStack.push(this.engine.getFen());
        this.engine.loadFen(previousFen);
        return true;
      }
    }
    return false;
  }

  /**
   * Redo move
   */
  redo(): boolean {
    if (this.redoStack.length > 0) {
      const nextFen = this.redoStack.pop();
      if (nextFen) {
        this.undoStack.push(this.engine.getFen());
        this.engine.loadFen(nextFen);
        return true;
      }
    }
    return false;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear undo/redo stacks
   */
  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Export game state for saving
   */
  exportState(gameMode: 'local' | 'ai' | 'online', gameId?: string): SavedGameState {
    return {
      fen: this.engine.getFen(),
      pgn: this.engine.exportPgn(),
      metadata: this.engine.getMetadata(),
      moveHistory: this.engine.getHistoryNotation(),
      savedAt: Date.now(),
      gameMode,
      gameId,
    };
  }

  /**
   * Import game state
   */
  importState(state: SavedGameState): void {
    this.engine.loadFen(state.fen);
    this.engine.setMetadata(state.metadata);
    this.clearHistory();
  }

  /**
   * Get engine instance
   */
  getEngine(): ChessGameEngine {
    return this.engine;
  }
}

