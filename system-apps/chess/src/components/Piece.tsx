import React from 'react';
import type { Piece as ChessPiece } from 'chess.js';
import './Piece.css';

export interface PieceProps {
  piece: ChessPiece | null;
  square: string;
  isDragging?: boolean;
  onClick?: () => void;
}

const pieceSymbols: Record<string, string> = {
  'wP': '♙',
  'wR': '♖',
  'wN': '♘',
  'wB': '♗',
  'wQ': '♕',
  'wK': '♔',
  'bP': '♟',
  'bR': '♜',
  'bN': '♞',
  'bB': '♝',
  'bQ': '♛',
  'bK': '♚',
};

export const Piece: React.FC<PieceProps> = ({ piece, square, isDragging, onClick }) => {
  if (!piece) return null;

  const pieceKey = `${piece.color}${piece.type.toUpperCase()}`;
  const symbol = pieceSymbols[pieceKey] || '?';

  return (
    <div
      className={`chess-piece ${piece.color === 'w' ? 'white' : 'black'} ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      data-square={square}
      data-piece={pieceKey}
    >
      {symbol}
    </div>
  );
};

