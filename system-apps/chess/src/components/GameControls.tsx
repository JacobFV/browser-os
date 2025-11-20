import React from 'react';
import './GameControls.css';

export interface GameControlsProps {
  onNewGame: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onResign?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExportPgn?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onRedo,
  onResign,
  onSave,
  onLoad,
  onExportPgn,
  canUndo = false,
  canRedo = false,
  disabled = false,
}) => {
  return (
    <div className="game-controls">
      <div className="control-group">
        <button
          className="control-button primary"
          onClick={onNewGame}
          disabled={disabled}
        >
          New Game
        </button>
        {onResign && (
          <button
            className="control-button danger"
            onClick={onResign}
            disabled={disabled}
          >
            Resign
          </button>
        )}
      </div>
      <div className="control-group">
        {onUndo && (
          <button
            className="control-button"
            onClick={onUndo}
            disabled={disabled || !canUndo}
            title="Undo last move"
          >
            ↶ Undo
          </button>
        )}
        {onRedo && (
          <button
            className="control-button"
            onClick={onRedo}
            disabled={disabled || !canRedo}
            title="Redo move"
          >
            ↷ Redo
          </button>
        )}
      </div>
      <div className="control-group">
        {onSave && (
          <button
            className="control-button"
            onClick={onSave}
            disabled={disabled}
            title="Save game"
          >
            💾 Save
          </button>
        )}
        {onLoad && (
          <button
            className="control-button"
            onClick={onLoad}
            disabled={disabled}
            title="Load game"
          >
            📂 Load
          </button>
        )}
        {onExportPgn && (
          <button
            className="control-button"
            onClick={onExportPgn}
            disabled={disabled}
            title="Export PGN"
          >
            📄 Export PGN
          </button>
        )}
      </div>
    </div>
  );
};

