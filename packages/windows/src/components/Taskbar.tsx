import React from 'react';

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
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#c0c0c0',
        borderTop: '2px outset #c0c0c0',
        height: '30px',
        padding: '2px',
        fontFamily: "'MS Sans Serif', sans-serif",
      }}
    >
      <button
        className="browser-os-taskbar__start"
        onClick={onStartClick}
        aria-label="Start"
        style={{
          background: 'linear-gradient(to bottom, #c0c0c0, #808080)',
          border: '2px outset #c0c0c0',
          padding: '2px 8px',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '11px',
          color: 'black',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to bottom, #d4d0c8, #a0a0a0)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to bottom, #c0c0c0, #808080)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.borderStyle = 'inset';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.borderStyle = 'outset';
        }}
      >
        <span className="browser-os-taskbar__start-text">Start</span>
      </button>
      <div
        className="browser-os-taskbar__tasks"
        style={{
          flex: 1,
          display: 'flex',
          gap: '2px',
          margin: '0 4px',
        }}
      >
        {children}
      </div>
      <div
        className="browser-os-taskbar__tray"
        style={{
          width: '100px',
          height: '24px',
          background: '#c0c0c0',
          border: '2px inset #c0c0c0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 4px',
        }}
      ></div>
    </div>
  );
};

