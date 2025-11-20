import type { SavedGameState } from '../engine/GameState';
import type { ChessGameEngine } from '../engine/ChessGameEngine';

/**
 * Save game state to localStorage
 */
export function saveGameToStorage(key: string, state: SavedGameState): void {
  try {
    localStorage.setItem(`chess_game_${key}`, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

/**
 * Load game state from localStorage
 */
export function loadGameFromStorage(key: string): SavedGameState | null {
  try {
    const data = localStorage.getItem(`chess_game_${key}`);
    if (!data) return null;
    return JSON.parse(data) as SavedGameState;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

/**
 * List all saved games
 */
export function listSavedGames(): string[] {
  const games: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chess_game_')) {
      games.push(key.replace('chess_game_', ''));
    }
  }
  return games;
}

/**
 * Delete saved game
 */
export function deleteSavedGame(key: string): void {
  localStorage.removeItem(`chess_game_${key}`);
}

/**
 * Export game as PGN string
 */
export function exportToPgn(engine: ChessGameEngine, metadata?: { white?: string; black?: string; event?: string }): string {
  let pgn = '';
  
  if (metadata) {
    if (metadata.event) pgn += `[Event "${metadata.event}"]\n`;
    if (metadata.white) pgn += `[White "${metadata.white}"]\n`;
    if (metadata.black) pgn += `[Black "${metadata.black}"]\n`;
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
  }
  
  pgn += '\n';
  pgn += engine.exportPgn();
  
  return pgn;
}

/**
 * Import game from PGN string
 */
export function importFromPgn(pgn: string, engine: ChessGameEngine): boolean {
  try {
    engine.loadPgn(pgn);
    return true;
  } catch (error) {
    console.error('Failed to import PGN:', error);
    return false;
  }
}

