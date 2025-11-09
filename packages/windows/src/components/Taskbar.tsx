import React from 'react';
import './Taskbar.css';

export interface TaskbarProps {
  children?: React.ReactNode;
  onStartClick?: () => void;
  className?: string;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  children,
  onStartClick,
  className = '',
}) => {
  return (
    <div className={`browser-os-taskbar ${className}`}>
      <button
        className="browser-os-taskbar__start"
        onClick={onStartClick}
        aria-label="Start"
      >
        <span className="browser-os-taskbar__start-text">Start</span>
      </button>
      <div className="browser-os-taskbar__tasks">{children}</div>
      <div className="browser-os-taskbar__tray"></div>
    </div>
  );
};

