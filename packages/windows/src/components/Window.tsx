import React from 'react';
import './Window.css';

export interface WindowProps {
  title?: string;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export const Window: React.FC<WindowProps> = ({
  title = 'Window',
  children,
  width = 600,
  height = 400,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}) => {
  return (
    <div
      className={`browser-os-window ${className}`}
      style={{ width, height }}
    >
      <div className="browser-os-window__titlebar">
        <div className="browser-os-window__title">{title}</div>
        <div className="browser-os-window__controls">
          {onMinimize && (
            <button
              className="browser-os-window__control browser-os-window__control--minimize"
              onClick={onMinimize}
              aria-label="Minimize"
            >
              −
            </button>
          )}
          {onMaximize && (
            <button
              className="browser-os-window__control browser-os-window__control--maximize"
              onClick={onMaximize}
              aria-label="Maximize"
            >
              □
            </button>
          )}
          {onClose && (
            <button
              className="browser-os-window__control browser-os-window__control--close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="browser-os-window__content">{children}</div>
    </div>
  );
};

