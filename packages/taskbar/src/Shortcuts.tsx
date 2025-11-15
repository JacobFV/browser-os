import React from 'react';
import type { TaskbarShortcut } from './types';
import './Shortcuts.css';

export interface ShortcutsProps {
  shortcuts: TaskbarShortcut[];
  onShortcutClick: (appId: string) => void;
}

export const Shortcuts: React.FC<ShortcutsProps> = ({ shortcuts, onShortcutClick }) => {
  return (
    <div className="taskbar-shortcuts">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.appId}
          className="taskbar-shortcut"
          onClick={() => onShortcutClick(shortcut.appId)}
          title={shortcut.name}
        >
          {shortcut.icon ? (
            <img src={shortcut.icon} alt={shortcut.name} className="taskbar-shortcut-icon" />
          ) : (
            <span className="taskbar-shortcut-icon-placeholder">{shortcut.name[0]}</span>
          )}
        </button>
      ))}
    </div>
  );
};

