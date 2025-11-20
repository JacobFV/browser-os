import React from 'react';
import { SettingsPanel } from './SettingsPanel';
import { useGameSettings } from '../state/useGameSettings';
import type { EventBus } from '@browser-os/events';
import './ChessSettingsWindow.css';

export interface ChessSettingsWindowProps {
  windowId?: string;
  appId?: string;
  eventBus?: EventBus;
}

export const ChessSettingsWindow: React.FC<ChessSettingsWindowProps> = ({ windowId }) => {
  const settings = useGameSettings();

  return (
    <div className="chess-settings-window">
      <h1>Chess Settings</h1>
      <SettingsPanel
        chatEnabled={settings.settings.chatEnabled}
        onChatEnabledChange={settings.setChatEnabled}
        soundsEnabled={settings.settings.soundsEnabled}
        onSoundsEnabledChange={settings.setSoundsEnabled}
        boardTheme={settings.settings.boardTheme}
        onBoardThemeChange={settings.setBoardTheme}
        pieceSet={settings.settings.pieceSet}
        onPieceSetChange={settings.setPieceSet}
      />
    </div>
  );
};

