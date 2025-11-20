import React from 'react';
import type { GameStatus, GameResult } from '../engine/ChessGameEngine';
import './GameStatus.css';

export interface GameStatusProps {
  status: GameStatus;
  result: GameResult;
  currentTurn: 'w' | 'b';
  isOnline?: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  whitePlayer?: string;
  blackPlayer?: string;
}

export const GameStatusComponent: React.FC<GameStatusProps> = ({
  status,
  result,
  currentTurn,
  isOnline = false,
  connectionStatus,
  whitePlayer = 'White',
  blackPlayer = 'Black',
}) => {
  const getStatusText = () => {
    if (result) {
      switch (result) {
        case 'white':
          return `${whitePlayer} wins!`;
        case 'black':
          return `${blackPlayer} wins!`;
        case 'draw':
          return 'Game drawn';
        default:
          return 'Game over';
      }
    }

    switch (status) {
      case 'check':
        return `${currentTurn === 'w' ? whitePlayer : blackPlayer} is in check`;
      case 'checkmate':
        return `Checkmate! ${currentTurn === 'w' ? blackPlayer : whitePlayer} wins`;
      case 'stalemate':
        return 'Stalemate - Draw';
      case 'draw':
        return 'Draw';
      case 'resigned':
        return result === 'white' ? `${whitePlayer} wins by resignation` : `${blackPlayer} wins by resignation`;
      case 'active':
      default:
        return `${currentTurn === 'w' ? whitePlayer : blackPlayer}'s turn`;
    }
  };

  const getStatusClass = () => {
    if (result || status === 'checkmate' || status === 'stalemate' || status === 'draw' || status === 'resigned') {
      return 'game-over';
    }
    if (status === 'check') {
      return 'check';
    }
    return 'active';
  };

  return (
    <div className={`game-status ${getStatusClass()}`}>
      <div className="status-text">{getStatusText()}</div>
      {isOnline && connectionStatus && (
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected'}
          {connectionStatus === 'connecting' && '🟡 Connecting...'}
          {connectionStatus === 'disconnected' && '🔴 Disconnected'}
        </div>
      )}
    </div>
  );
};

