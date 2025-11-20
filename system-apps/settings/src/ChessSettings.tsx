import React, { useState, useEffect } from 'react';
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
    return <div>Loading chess settings...</div>;
  }

  return (
    <div className="chess-settings">
      <h2>Chess Settings</h2>
      <p>Configure your chess game preferences</p>

      <div className="settings-section">
        <h3>Game Preferences</h3>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={chatEnabled}
              onChange={(e) => setChatEnabled(e.target.checked)}
            />
            <span>Enable chat in online games</span>
          </label>
          <p className="setting-description">
            Allow chat messages when playing online multiplayer games
          </p>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={soundsEnabled}
              onChange={(e) => setSoundsEnabled(e.target.checked)}
            />
            <span>Enable sound effects</span>
          </label>
          <p className="setting-description">
            Play sounds for moves, captures, checks, and checkmates
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <label htmlFor="board-theme">Board Theme</label>
          <select
            id="board-theme"
            value={boardTheme}
            onChange={(e) => setBoardTheme(e.target.value)}
            className="setting-select"
          >
            <option value="classic">Classic</option>
            <option value="wood">Wood</option>
            <option value="marble">Marble</option>
          </select>
          <p className="setting-description">
            Choose the visual style of the chess board
          </p>
        </div>

        <div className="setting-item">
          <label htmlFor="piece-set">Piece Set</label>
          <select
            id="piece-set"
            value={pieceSet}
            onChange={(e) => setPieceSet(e.target.value)}
            className="setting-select"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
          <p className="setting-description">
            Choose the style of chess pieces
          </p>
        </div>
      </div>
    </div>
  );
};

