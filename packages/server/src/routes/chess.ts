import { Router } from 'express';
import { ChessService } from '../services/chess/ChessService';

export function createChessRoutes(chessService: ChessService): Router {
  const router = Router();

  /**
   * GET /api/chess/games
   * List all active games
   */
  router.get('/games', (req, res) => {
    const rooms = chessService.getActiveRooms();
    res.json(rooms);
  });

  /**
   * GET /api/chess/games/:gameId
   * Get game state
   */
  router.get('/games/:gameId', (req, res) => {
    const { gameId } = req.params;
    const room = chessService.getRoom(gameId);
    
    if (!room) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(room.getState());
  });

  /**
   * POST /api/chess/games
   * Create a new game
   */
  router.post('/games', (req, res) => {
    // This endpoint is mainly for REST API - actual game creation happens via WebSocket
    res.json({ message: 'Use WebSocket to create games' });
  });

  return router;
}

