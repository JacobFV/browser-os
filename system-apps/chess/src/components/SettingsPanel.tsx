import React from 'react';
import './SettingsPanel.css';

export interface SettingsPanelProps {
  chatEnabled: boolean;
  onChatEnabledChange: (enabled: boolean) => void;
  soundsEnabled: boolean;
  onSoundsEnabledChange: (enabled: boolean) => void;
  boardTheme: string;
  onBoardThemeChange: (theme: string) => void;
  pieceSet: string;
  onPieceSetChange: (set: string) => void;
}

const boardThemes = [
  { value: 'classic', label: 'Classic' },
  { value: 'wood', label: 'Wood' },
  { value: 'marble', label: 'Marble' },
];

const pieceSets = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  chatEnabled,
  onChatEnabledChange,
  soundsEnabled,
  onSoundsEnabledChange,
  boardTheme,
  onBoardThemeChange,
  pieceSet,
  onPieceSetChange,
}) => {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      
      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={chatEnabled}
            onChange={(e) => onChatEnabledChange(e.target.checked)}
          />
          Enable chat in online games
        </label>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={soundsEnabled}
            onChange={(e) => onSoundsEnabledChange(e.target.checked)}
          />
          Enable sound effects
        </label>
      </div>

      <div className="setting-group">
        <label htmlFor="board-theme">Board Theme</label>
        <select
          id="board-theme"
          value={boardTheme}
          onChange={(e) => onBoardThemeChange(e.target.value)}
          className="setting-select"
        >
          {boardThemes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="piece-set">Piece Set</label>
        <select
          id="piece-set"
          value={pieceSet}
          onChange={(e) => onPieceSetChange(e.target.value)}
          className="setting-select"
        >
          {pieceSets.map((set) => (
            <option key={set.value} value={set.value}>
              {set.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

