import type { Square, Move } from 'chess.js';

/**
 * Convert square coordinates to Square type
 */
export function coordsToSquare(rank: number, file: number): Square {
  const fileChar = String.fromCharCode(97 + file);
  const rankNum = rank + 1;
  return `${fileChar}${rankNum}` as Square;
}

/**
 * Convert Square to coordinates
 */
export function squareToCoords(square: Square): { rank: number; file: number } {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square.charAt(1), 10) - 1;
  return { rank, file };
}

/**
 * Format move in algebraic notation
 */
export function formatMove(move: Move): string {
  return move.san;
}

/**
 * Parse PGN string
 */
export function parsePgn(pgn: string): string[] {
  // Simple PGN parser - extracts moves
  const moves: string[] = [];
  const lines = pgn.split('\n');
  
  for (const line of lines) {
    // Skip comments and headers
    if (line.startsWith('[') || line.startsWith('%') || line.trim() === '') {
      continue;
    }
    
    // Extract moves (format: 1. e4 e5 2. Nf3 Nc6 ...)
    const moveMatches = line.match(/\d+\.\s*([^\s]+(?:\s+[^\s]+)?)/g);
    if (moveMatches) {
      for (const match of moveMatches) {
        const movePart = match.replace(/^\d+\.\s*/, '');
        const parts = movePart.split(/\s+/);
        moves.push(...parts.filter(p => p && !p.match(/^\d+\./)));
      }
    }
  }
  
  return moves.filter(m => m && !m.match(/^\d+$/));
}

/**
 * Generate move description
 */
export function getMoveDescription(move: Move): string {
  if (move.flags.includes('c')) {
    return `${move.piece.toUpperCase()} castles`;
  }
  if (move.flags.includes('e')) {
    return `${move.piece.toUpperCase()} captures en passant`;
  }
  if (move.promotion) {
    return `Pawn promotes to ${move.promotion.toUpperCase()}`;
  }
  if (move.captured) {
    return `${move.piece.toUpperCase()} captures ${move.captured}`;
  }
  return `${move.piece.toUpperCase()} moves to ${move.to}`;
}

