import React, { useState, useRef, useEffect } from 'react';
import { Window as WindowType } from './window-manager';
import interact from 'interactjs';

export interface WindowViewProps {
  window: WindowType;
  onClose: (winId: string) => void;
  onFocus: (winId: string) => void;
  onMove?: (winId: string, x: number, y: number) => void;
  onResize?: (winId: string, w: number, h: number) => void;
  onMinimize?: (winId: string) => void;
  onMaximize?: (winId: string) => void;
  onRestore?: (winId: string) => void;
  children?: React.ReactNode;
}

export const WindowView: React.FC<WindowViewProps> = ({
  window,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  onRestore,
  children,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!windowRef.current) return;

    const element = windowRef.current;
    
    // Make window draggable
    interact(element)
      .draggable({
        listeners: {
          start() {
            setIsDragging(true);
            dragStartPosRef.current = { x: window.bounds.x, y: window.bounds.y };
            onFocus(window.id);
          },
          move(event) {
            if (dragStartPosRef.current) {
              const x = dragStartPosRef.current.x + event.dx;
              const y = dragStartPosRef.current.y + event.dy;
              if (onMove) {
                onMove(window.id, x, y);
              }
            }
          },
          end() {
            setIsDragging(false);
            dragStartPosRef.current = null;
          },
        },
        modifiers: [
          interact.modifiers.snap({
            targets: [
              { x: 0, y: 0 },
              { x: globalThis.innerWidth - window.bounds.w, y: 0 },
            ],
            range: 20,
          }),
        ],
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const { width, height } = event.rect;
            if (onResize) {
              onResize(window.id, width, height);
            }
          },
        },
        modifiers: [
          interact.modifiers.aspectRatio({
            ratio: 'preserve',
          }),
        ],
      });

    return () => {
      interact(element).unset();
    };
  }, [window.id, window.bounds.w, window.bounds.h, onFocus, onMove, onResize]);

  if (window.state === 'minimized') {
    return null;
  }

  const handleMouseDown = () => {
    onFocus(window.id);
  };

  const windowStyle: React.CSSProperties = {
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
    cursor: isDragging ? 'grabbing' : 'default',
  };

  if (window.state === 'maximized') {
    windowStyle.width = '100vw';
    windowStyle.height = 'calc(100vh - 40px)'; // Account for taskbar
    windowStyle.left = 0;
    windowStyle.top = 0;
  }

  return (
    <div
      ref={windowRef}
      className="window"
      style={windowStyle}
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
        <div style={{ display: 'flex', gap: '4px' }}>
          {onMinimize && (
            <button
              className="window-minimize"
              onClick={() => onMinimize(window.id)}
              style={{
                background: '#c0c0c0',
                border: '1px solid #000',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '12px',
              }}
              title="Minimize"
            >
              −
            </button>
          )}
          {onMaximize && window.state !== 'maximized' && (
            <button
              className="window-maximize"
              onClick={() => onMaximize(window.id)}
              style={{
                background: '#c0c0c0',
                border: '1px solid #000',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '12px',
              }}
              title="Maximize"
            >
              □
            </button>
          )}
          {onRestore && window.state === 'maximized' && (
            <button
              className="window-restore"
              onClick={() => onRestore(window.id)}
              style={{
                background: '#c0c0c0',
                border: '1px solid #000',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '12px',
              }}
              title="Restore"
            >
              ⊞
            </button>
          )}
          <button
            className="window-close"
            onClick={() => onClose(window.id)}
            style={{
              background: '#c0c0c0',
              border: '1px solid #000',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: '12px',
            }}
            title="Close"
          >
            ×
          </button>
        </div>
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
