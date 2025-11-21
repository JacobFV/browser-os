import { Chess, type Square, type Move, type Piece as ChessPiece } from 'chess.js';

export type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
export type GameResult = 'white' | 'black' | 'draw' | null;

export interface GameMetadata {
  whitePlayer?: string;
  blackPlayer?: string;
  result?: GameResult;
  status: GameStatus;
  startedAt?: number;
  endedAt?: number;
}

export class ChessGameEngine {
  private chess: Chess;
  private metadata: GameMetadata;
  private moveHistory: Move[] = [];

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess();
    this.metadata = {
      status: 'active',
    };
  }

  /**
   * Get current FEN string
   */
  getFen(): string {
    return this.chess.fen();
  }

  /**
   * Get current board state as 2D array
   */
  getBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = [];
    for (let rank = 7; rank >= 0; rank--) {
      const row: (ChessPiece | null)[] = [];
      for (let file = 0; file < 8; file++) {
        const square = `${String.fromCharCode(97 + file)}${rank + 1}` as Square;
        const piece = this.chess.get(square);
        row.push(piece ?? null);
      }
      board.push(row);
    }
    return board;
  }

  /**
   * Get current turn ('w' or 'b')
   */
  getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Get all legal moves for a square
   */
  getLegalMoves(from: Square): Square[] {
    const moves = this.chess.moves({ square: from, verbose: true });
    return moves.map((move) => move.to);
  }

  /**
   * Get all legal moves for current position
   */
  getAllLegalMoves(): Move[] {
    return this.chess.moves({ verbose: true });
  }

  /**
   * Check if a move is legal
   */
  isLegalMove(from: Square, to: Square, promotion?: string): boolean {
    try {
      const moves = this.chess.moves({ square: from, verbose: true });
      return moves.some((move) => {
        if (move.to !== to) return false;
        if (promotion && move.promotion !== promotion) return false;
        return true;
      });
    } catch {
      return false;
    }
  }

  /**
   * Make a move
   */
  makeMove(from: Square, to: Square, promotion?: string): Move | null {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as any,
      });

      if (move) {
        this.moveHistory.push(move);
        this.updateGameStatus();
      }

      return move || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Make a move from algebraic notation
   */
  makeMoveFromNotation(notation: string): Move | null {
    try {
      const move = this.chess.move(notation);
      if (move) {
        this.moveHistory.push(move);
        this.updateGameStatus();
      }
      return move || null;
    } catch {
      return null;
    }
  }

  /**
   * Undo last move
   */
  undo(): Move | null {
    const move = this.chess.undo();
    if (move) {
      this.moveHistory.pop();
      this.updateGameStatus();
    }
    return move || null;
  }

  /**
   * Reset game to starting position
   */
  reset(): void {
    this.chess.reset();
    this.moveHistory = [];
    this.metadata = {
      status: 'active',
      startedAt: Date.now(),
    };
  }

  /**
   * Load game from FEN
   */
  loadFen(fen: string): void {
    this.chess.load(fen);
    this.updateGameStatus();
  }

  /**
   * Load game from PGN
   */
  loadPgn(pgn: string): void {
    this.chess.loadPgn(pgn);
    this.moveHistory = this.chess.history({ verbose: true });
    this.updateGameStatus();
  }

  /**
   * Export game as PGN
   */
  exportPgn(): string {
    return this.chess.pgn();
  }

  /**
   * Get move history
   */
  getHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get move history as algebraic notation
   */
  getHistoryNotation(): string[] {
    return this.chess.history();
  }

  /**
   * Check if in check
   */
  isInCheck(): boolean {
    return this.chess.isCheck();
  }

  /**
   * Check if in checkmate
   */
  isInCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * Check if in stalemate
   */
  isInStalemate(): boolean {
    return this.chess.isStalemate();
  }

  /**
   * Check if game is drawn
   */
  isDraw(): boolean {
    return (
      this.chess.isDraw() ||
      this.chess.isInsufficientMaterial() ||
      this.chess.isThreefoldRepetition() ||
      this.chess.isStalemate()
    );
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Get game status
   */
  getStatus(): GameStatus {
    return this.metadata.status;
  }

  /**
   * Get game metadata
   */
  getMetadata(): GameMetadata {
    return { ...this.metadata };
  }

  /**
   * Set game metadata
   */
  setMetadata(metadata: Partial<GameMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Resign game
   */
  resign(color: 'w' | 'b'): void {
    this.metadata.status = 'resigned';
    this.metadata.result = color === 'w' ? 'black' : 'white';
    this.metadata.endedAt = Date.now();
  }

  /**
   * Update game status based on current position
   */
  private updateGameStatus(): void {
    if (this.isInCheckmate()) {
      this.metadata.status = 'checkmate';
      this.metadata.result = this.getTurn() === 'w' ? 'black' : 'white';
      this.metadata.endedAt = Date.now();
    } else if (this.isInStalemate() || this.isDraw()) {
      this.metadata.status = this.isInStalemate() ? 'stalemate' : 'draw';
      this.metadata.result = 'draw';
      this.metadata.endedAt = Date.now();
    } else if (this.isInCheck()) {
      this.metadata.status = 'check';
    } else {
      this.metadata.status = 'active';
    }
  }

  /**
   * Get the last move
   */
  getLastMove(): Move | null {
    return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
  }
}

