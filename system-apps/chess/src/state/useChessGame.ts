import { useState, useCallback, useEffect } from 'react';
import type { Square } from 'chess.js';
import { ChessGameEngine } from '../engine/ChessGameEngine';
import { GameState } from '../engine/GameState';
import { playMoveSound, playCaptureSound, playCheckSound, playCheckmateSound } from '../utils/soundEffects';

export type GameMode = 'local' | 'ai' | 'online';

export interface UseChessGameOptions {
  mode: GameMode;
  onMove?: (move: any) => void;
  onGameOver?: (result: string) => void;
}

export function useChessGame(options: UseChessGameOptions) {
  const { mode, onMove, onGameOver } = options;
  
  const [engine] = useState(() => new ChessGameEngine());
  const [gameState] = useState(() => new GameState(engine));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const board = engine.getBoard();
  const turn = engine.getTurn();
  const status = engine.getStatus();
  const metadata = engine.getMetadata();

  useEffect(() => {
    if (status === 'checkmate' || status === 'stalemate' || status === 'draw' || status === 'resigned') {
      if (metadata.result && onGameOver) {
        onGameOver(metadata.result);
      }
      if (status === 'checkmate') {
        playCheckmateSound();
      }
    } else if (status === 'check') {
      playCheckSound();
    }
  }, [status, metadata.result, onGameOver]);

  const handleSquareClick = useCallback((square: Square) => {
    if (selectedSquare === null) {
      // Select piece
      const piece = board[7 - Math.floor((square.charCodeAt(1) - 49))][square.charCodeAt(0) - 97];
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        setLegalMoves(engine.getLegalMoves(square));
      }
    } else {
      // Try to make move
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (legalMoves.includes(square)) {
        // Make move
        const move = engine.makeMove(selectedSquare, square);
        if (move) {
          gameState.saveState();
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          
          // Play sound
          if (move.captured) {
            playCaptureSound();
          } else {
            playMoveSound();
          }
          
          if (onMove) {
            onMove(move);
          }
        }
      } else {
        // Select different piece
        const piece = board[7 - Math.floor((square.charCodeAt(1) - 49))][square.charCodeAt(0) - 97];
        if (piece && piece.color === turn) {
          setSelectedSquare(square);
          setLegalMoves(engine.getLegalMoves(square));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    }
  }, [selectedSquare, legalMoves, board, turn, engine, gameState, onMove]);

  const handlePieceMove = useCallback((from: Square, to: Square) => {
    const move = engine.makeMove(from, to);
    if (move) {
      gameState.saveState();
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMoves([]);
      
      if (move.captured) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      
      if (onMove) {
        onMove(move);
      }
    }
  }, [engine, gameState, onMove]);

  const undo = useCallback(() => {
    if (gameState.undo()) {
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(engine.getLastMove() ? {
        from: engine.getLastMove()!.from,
        to: engine.getLastMove()!.to,
      } : null);
    }
  }, [engine, gameState]);

  const redo = useCallback(() => {
    if (gameState.redo()) {
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(engine.getLastMove() ? {
        from: engine.getLastMove()!.from,
        to: engine.getLastMove()!.to,
      } : null);
    }
  }, [engine, gameState]);

  const reset = useCallback(() => {
    engine.reset();
    gameState.clearHistory();
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
  }, [engine, gameState]);

  const makeMoveFromNotation = useCallback((notation: string) => {
    const move = engine.makeMoveFromNotation(notation);
    if (move) {
      gameState.saveState();
      setLastMove({ from: move.from, to: move.to });
      setSelectedSquare(null);
      setLegalMoves([]);
      
      if (onMove) {
        onMove(move);
      }
    }
    return move;
  }, [engine, gameState, onMove]);

  return {
    engine,
    gameState,
    board,
    turn,
    status,
    metadata,
    selectedSquare,
    legalMoves,
    lastMove,
    handleSquareClick,
    handlePieceMove,
    undo,
    redo,
    reset,
    makeMoveFromNotation,
    canUndo: gameState.canUndo(),
    canRedo: gameState.canRedo(),
  };
}

