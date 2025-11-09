import React, { useState, useRef, useEffect } from 'react';
import { Window as WindowType } from './window-manager';
import interact from 'interactjs';

export interface WindowViewProps {
  window: WindowType;
  onClose: (winId: string) => void;
  onFocus: (winId: string) => void;
  onMove?: (winId: string, x: number, y: number) => void;
  onResize?: (winId: string, w: number, h: number) => void;
  children?: React.ReactNode;
}

export const WindowView: React.FC<WindowViewProps> = ({
  window,
  onClose,
  onFocus,
  onMove,
  onResize,
  children,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!windowRef.current) return;

    const element = windowRef.current;
    
    // Make window draggable
    interact(element)
      .draggable({
        listeners: {
          start() {
            setIsDragging(true);
            onFocus(window.id);
          },
          move(event) {
            const x = window.bounds.x + event.dx;
            const y = window.bounds.y + event.dy;
            if (onMove) {
              onMove(window.id, x, y);
            }
          },
          end() {
            setIsDragging(false);
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
  }, [window.id, window.bounds, onFocus, onMove, onResize]);

  if (window.state === 'minimized') {
    return null;
  }

  const handleMouseDown = () => {
    onFocus(window.id);
  };

  return (
    <div
      ref={windowRef}
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
        cursor: isDragging ? 'grabbing' : 'default',
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
