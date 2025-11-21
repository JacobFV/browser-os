import React, { useState, useEffect } from 'react';
import { Toggle, Dropdown } from '@browser-os/ui';
import './ChessSettings.css';

export interface ChessSettingsProps {
  loading?: boolean;
}

export const ChessSettings: React.FC<ChessSettingsProps> = ({ loading }) => {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [boardTheme, setBoardTheme] = useState('classic');
  const [pieceSet, setPieceSet] = useState('classic');

  useEffect(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem('chess_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setChatEnabled(settings.chatEnabled ?? true);
        setSoundsEnabled(settings.soundsEnabled ?? true);
        setBoardTheme(settings.boardTheme ?? 'classic');
        setPieceSet(settings.pieceSet ?? 'classic');
      }
    } catch (error) {
      console.error('[ChessSettings] Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    const settings = {
      chatEnabled,
      soundsEnabled,
      boardTheme,
      pieceSet,
    };
    localStorage.setItem('chess_settings', JSON.stringify(settings));
  }, [chatEnabled, soundsEnabled, boardTheme, pieceSet]);

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h2 className="settings-panel-title">Chess Settings</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Configure your chess game preferences
      </p>

      <div className="settings-section">
        <h3 className="settings-section-title">Game Preferences</h3>
        
        <div className="setting-item">
          <Toggle
            label="Enable chat in online games"
            checked={chatEnabled}
            onChange={setChatEnabled}
            hint="Allow chat messages when playing online multiplayer games"
          />
        </div>

        <div className="setting-item">
          <Toggle
            label="Enable sound effects"
            checked={soundsEnabled}
            onChange={setSoundsEnabled}
            hint="Play sounds for moves, captures, checks, and checkmates"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>
        
        <div className="setting-item">
          <Dropdown
            label="Board Theme"
            value={boardTheme}
            onChange={setBoardTheme}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'wood', label: 'Wood' },
              { value: 'marble', label: 'Marble' },
            ]}
            hint="Choose the visual style of the chess board"
          />
        </div>

        <div className="setting-item">
          <Dropdown
            label="Piece Set"
            value={pieceSet}
            onChange={setPieceSet}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'modern', label: 'Modern' },
            ]}
            hint="Choose the style of chess pieces"
          />
        </div>
      </div>
    </div>
  );
};
