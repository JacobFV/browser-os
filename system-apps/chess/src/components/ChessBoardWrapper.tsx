import React, { useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import type { ChessGameEngine } from '../engine/ChessGameEngine';
import { squareToCoords } from '../utils/chessNotation';
import './ChessBoardWrapper.css';

export interface ChessBoardWrapperProps {
  engine: ChessGameEngine;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  onPieceMove?: (from: Square, to: Square) => void;
  orientation?: 'white' | 'black';
  disabled?: boolean;
  gameMode?: 'local' | 'ai' | 'online';
}

export const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
  engine,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquareClick,
  onPieceMove,
  orientation = 'white',
  disabled = false,
  gameMode = 'local',
}) => {
  const turn = engine.getTurn();
  const fen = engine.getFen();
  const isCheck = engine.isInCheck();
  const isCheckmate = engine.isInCheckmate();

  // Convert legal moves to array of squares for highlighting
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        background: 'rgba(186, 202, 68, 0.8)',
      };
    }

    // Highlight legal moves
    legalMoves.forEach((square) => {
      if (square !== selectedSquare) {
        styles[square] = {
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)',
        };
      }
    });

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        background: 'rgba(205, 210, 106, 0.8)',
      };
      styles[lastMove.to] = {
        background: 'rgba(205, 210, 106, 0.8)',
      };
    }

    // Highlight check
    if (isCheck) {
      const kingSquare = findKingSquare(engine.getBoard(), turn);
      if (kingSquare) {
        styles[kingSquare] = {
          background: 'rgba(255, 107, 107, 0.8)',
          animation: 'check-pulse 1s ease-in-out infinite',
        };
      }
    }

    return styles;
  }, [selectedSquare, legalMoves, lastMove, isCheck, turn, engine]);

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (disabled) return false;

    // Check if it's the player's turn
    if (gameMode === 'online' && turn !== 'w') return false;
    if (gameMode === 'ai' && turn === 'b') return false;

    // Don't allow dropping on the same square
    if (sourceSquare === targetSquare) return false;

    // Check that we're moving a piece of the current player's color
    const board = engine.getBoard();
    const coords = squareToCoords(sourceSquare);
    // Board is indexed with rank 7 at index 0, rank 0 at index 7
    const piece = board[7 - coords.rank][coords.file];
    if (!piece || piece.color !== turn) {
      return false;
    }

    // Validate the move is legal (but don't make it yet)
    if (!engine.isLegalMove(sourceSquare, targetSquare)) {
      return false;
    }

    // Move is valid, notify parent component to make the move and update state
    // handlePieceMove will call engine.makeMove() and update state
    // react-chessboard will re-render when the FEN prop changes
    if (onPieceMove) {
      onPieceMove(sourceSquare, targetSquare);
      // Return true to tell react-chessboard the drop was accepted
      // The position will update via the FEN prop when state updates
      return true;
    }

    return false;
  };

  // Handle onDrop for v4 API - it receives an object with sourceSquare and targetSquare
  const handleDrop = (move: { sourceSquare: Square; targetSquare: Square }): boolean => {
    return handlePieceDrop(move.sourceSquare, move.targetSquare);
  };

  const handleSquareClick = (square: Square) => {
    if (disabled) return;
    onSquareClick(square);
  };

  return (
    <div className="chess-board-wrapper">
      <Chessboard
        position={fen}
        onPieceDrop={handleDrop}
        onSquareClick={handleSquareClick}
        boardOrientation={orientation}
        arePiecesDraggable={!disabled && (gameMode === 'local' || (gameMode === 'online' && turn === 'w') || (gameMode === 'ai' && turn === 'w'))}
        customSquareStyles={customSquareStyles}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      />
      {isCheckmate && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            {turn === 'w' ? 'Black' : 'White'} wins by checkmate!
          </div>
        </div>
      )}
    </div>
  );
};

function findKingSquare(board: (any | null)[][], color: 'w' | 'b'): Square | null {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        const fileChar = String.fromCharCode(97 + file);
        const rankNum = rank + 1;
        return `${fileChar}${rankNum}` as Square;
      }
    }
  }
  return null;
}

