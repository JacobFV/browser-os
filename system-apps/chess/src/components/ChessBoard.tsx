import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Square } from 'chess.js';
import { Piece } from './Piece';
import { coordsToSquare, squareToCoords } from '../utils/chessNotation';
import type { ChessGameEngine } from '../engine/ChessGameEngine';
import './ChessBoard.css';

export interface ChessBoardProps {
  engine: ChessGameEngine;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  onPieceMove?: (from: Square, to: Square) => void;
  orientation?: 'white' | 'black';
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquareClick,
  onPieceMove,
  orientation = 'white',
  disabled = false,
}) => {
  const [draggedPiece, setDraggedPiece] = useState<{ square: Square; piece: any } | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const board = engine.getBoard();
  const isCheck = engine.isInCheck();
  const isCheckmate = engine.isInCheckmate();
  const turn = engine.getTurn();
  const kingSquare = findKingSquare(board, turn);

  const handleSquareClick = useCallback((square: Square) => {
    if (disabled) return;
    onSquareClick(square);
  }, [disabled, onSquareClick]);

  const handleDragStart = useCallback((e: React.DragEvent, square: Square) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    const piece = engine.getBoard()[7 - squareToCoords(square).rank][squareToCoords(square).file];
    if (!piece || piece.color !== turn) {
      e.preventDefault();
      return;
    }

    setDraggedPiece({ square, piece });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', square);
  }, [disabled, engine, turn]);

  const handleDragOver = useCallback((e: React.DragEvent, square: Square) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedPiece) {
      const legalMovesForPiece = engine.getLegalMoves(draggedPiece.square);
      if (legalMovesForPiece.includes(square)) {
        setDragOverSquare(square);
      }
    }
  }, [draggedPiece, engine]);

  const handleDragLeave = useCallback(() => {
    setDragOverSquare(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, square: Square) => {
    e.preventDefault();
    setDragOverSquare(null);

    if (!draggedPiece) return;

    const from = draggedPiece.square;
    const to = square;

    if (from !== to && engine.isLegalMove(from, to)) {
      if (onPieceMove) {
        onPieceMove(from, to);
      } else {
        handleSquareClick(to);
      }
    }

    setDraggedPiece(null);
  }, [draggedPiece, engine, onPieceMove, handleSquareClick]);

  const handleDragEnd = useCallback(() => {
    setDraggedPiece(null);
    setDragOverSquare(null);
  }, []);

  const renderSquare = (rank: number, file: number) => {
    const isLight = (rank + file) % 2 === 0;
    const square = coordsToSquare(rank, file);
    const piece = board[rank][file];
    const isSelected = selectedSquare === square;
    const isLegalMove = legalMoves.includes(square);
    const isLastMoveFrom = lastMove?.from === square;
    const isLastMoveTo = lastMove?.to === square;
    const isInCheck = kingSquare === square && engine.isInCheck();
    const isDragOver = dragOverSquare === square;

    // Adjust coordinates based on orientation
    const displayRank = orientation === 'white' ? 7 - rank : rank;
    const displayFile = orientation === 'white' ? file : 7 - file;

    return (
      <div
        key={`${rank}-${file}`}
        className={`chess-square ${isLight ? 'light' : 'dark'} ${
          isSelected ? 'selected' : ''
        } ${isLegalMove ? 'legal-move' : ''} ${
          isLastMoveFrom || isLastMoveTo ? 'last-move' : ''
        } ${isInCheck ? 'check' : ''} ${isDragOver ? 'drag-over' : ''}`}
        onClick={() => handleSquareClick(square)}
        onDragOver={(e) => handleDragOver(e, square)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, square)}
        data-square={square}
      >
        {displayFile === 0 && (
          <span className="rank-label">{8 - displayRank}</span>
        )}
        {displayRank === 7 && (
          <span className="file-label">{String.fromCharCode(97 + displayFile)}</span>
        )}
        {piece && (
          <div
            draggable={!disabled && piece.color === turn}
            onDragStart={(e) => handleDragStart(e, square)}
            onDragEnd={handleDragEnd}
          >
            <Piece
              piece={piece}
              square={square}
              isDragging={draggedPiece?.square === square}
            />
          </div>
        )}
        {isLegalMove && !piece && (
          <div className="legal-move-indicator" />
        )}
      </div>
    );
  };

  return (
    <div className="chess-board" ref={boardRef}>
      <div className={`board-grid ${orientation}`}>
        {Array.from({ length: 8 }, (_, rank) =>
          Array.from({ length: 8 }, (_, file) => renderSquare(rank, file))
        )}
      </div>
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
        return coordsToSquare(rank, file);
      }
    }
  }
  return null;
}

