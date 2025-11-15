import React from 'react';
import type { TaskbarWindow } from './types';
import './TaskbarButton.css';

export interface TaskbarButtonProps {
  window: TaskbarWindow;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const TaskbarButton: React.FC<TaskbarButtonProps> = ({
  window,
  onClick,
  onContextMenu,
}) => {
  return (
    <button
      className={`taskbar-button ${window.isFocused ? 'focused' : ''} ${window.isMinimized ? 'minimized' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={window.title}
    >
      <span className="taskbar-button-label">{window.title}</span>
    </button>
  );
};

