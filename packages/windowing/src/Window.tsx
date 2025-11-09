import React from 'react';
import { Window as WindowType } from './window-manager';

export interface WindowViewProps {
  window: WindowType;
  onClose: (winId: string) => void;
  onFocus: (winId: string) => void;
  children?: React.ReactNode;
}

export const WindowView: React.FC<WindowViewProps> = ({
  window,
  onClose,
  onFocus,
  children,
}) => {
  if (window.state === 'minimized') {
    return null;
  }

  const handleMouseDown = () => {
    onFocus(window.id);
  };

  return (
    <div
      className="window"
      style={{
        position: 'absolute',
        left: window.bounds.x,
        top: window.bounds.y,
        width: window.bounds.w,
        height: window.bounds.h,
        zIndex: window.z,
        border: '2px solid #000',
        backgroundColor: '#c0c0c0',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="window-titlebar"
        style={{
          backgroundColor: '#000080',
          color: '#fff',
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
        }}
      >
        <span className="window-title">{window.title}</span>
        <button
          className="window-close"
          onClick={() => onClose(window.id)}
          style={{
            background: '#c0c0c0',
            border: '1px solid #000',
            cursor: 'pointer',
            padding: '2px 8px',
          }}
        >
          ×
        </button>
      </div>
      <div
        className="window-content"
        style={{
          flex: 1,
          padding: '8px',
          overflow: 'auto',
        }}
      >
        {children || <div>Window content for {window.appId}</div>}
      </div>
    </div>
  );
};

