import React from 'react';
import type { TaskbarWindow } from './types';
import type { AppRegistry } from '@browser-os/app-registry';
import './TaskbarButton.css';

export interface TaskbarButtonProps {
  window: TaskbarWindow;
  appRegistry?: AppRegistry;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const TaskbarButton: React.FC<TaskbarButtonProps> = ({
  window,
  appRegistry,
  onClick,
  onContextMenu,
}) => {
  const app = window.appId && appRegistry ? appRegistry.get(window.appId) : null;
  const icon = app?.manifest.icon;
  const appName = app?.manifest.name || window.title;

  return (
    <button
      className={`taskbar-button ${window.isFocused ? 'focused' : ''} ${window.isMinimized ? 'minimized' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={window.title}
    >
      {icon ? (
        <img src={icon} alt={appName} className="taskbar-button-icon" />
      ) : (
        <span className="taskbar-button-icon-placeholder">{appName[0]}</span>
      )}
      <span className="taskbar-button-label">{window.title}</span>
    </button>
  );
};

