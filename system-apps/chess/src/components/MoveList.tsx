import React from 'react';
import type { Move } from 'chess.js';
import './MoveList.css';

export interface MoveListProps {
  moves: Move[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentMoveIndex,
  onMoveClick,
}) => {
  // Group moves into pairs (white, black)
  const movePairs: Array<{ white: Move | null; black: Move | null; index: number }> = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i] || null,
      black: moves[i + 1] || null,
      index: Math.floor(i / 2) + 1,
    });
  }

  return (
    <div className="move-list">
      <div className="move-list-header">
        <h3>Move History</h3>
      </div>
      <div className="move-list-content">
        {movePairs.length === 0 ? (
          <div className="no-moves">No moves yet</div>
        ) : (
          movePairs.map((pair, idx) => (
            <div
              key={idx}
              className={`move-pair ${
                currentMoveIndex !== undefined &&
                currentMoveIndex >= idx * 2 &&
                currentMoveIndex < (idx + 1) * 2
                  ? 'current'
                  : ''
              }`}
            >
              <span className="move-number">{pair.index}.</span>
              <button
                className={`move-button white-move ${
                  currentMoveIndex === idx * 2 ? 'active' : ''
                }`}
                onClick={() => onMoveClick?.(idx * 2)}
                disabled={!onMoveClick}
              >
                {pair.white?.san || '...'}
              </button>
              {pair.black && (
                <button
                  className={`move-button black-move ${
                    currentMoveIndex === idx * 2 + 1 ? 'active' : ''
                  }`}
                  onClick={() => onMoveClick?.(idx * 2 + 1)}
                  disabled={!onMoveClick}
                >
                  {pair.black.san}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

