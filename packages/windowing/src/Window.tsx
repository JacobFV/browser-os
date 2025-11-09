import React, { useState, useRef, useEffect } from 'react';
import { Window } from './Window';
import interact from 'interactjs';

export interface WindowViewProps {
  window: Window;
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
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (!windowRef.current) return;

    const element = windowRef.current;
    
    // Make window draggable
    interact(element)
      .draggable({
        listeners: {
          start() {
            isInteractingRef.current = true;
            setIsDragging(true);
            dragStartPosRef.current = { x: window.bounds.x, y: window.bounds.y };
            onFocus(window.id);
          },
          move(event) {
            if (dragStartPosRef.current) {
              // Apply transform directly during drag for smooth movement
              event.target.style.transform = `translate(${event.dx}px, ${event.dy}px)`;
              // Don't call onMove during drag - it causes re-renders
            }
          },
          end(event) {
            isInteractingRef.current = false;
            setIsDragging(false);
            // Reset transform and update position
            event.target.style.transform = '';
            if (dragStartPosRef.current) {
              const x = dragStartPosRef.current.x + event.dx;
              const y = dragStartPosRef.current.y + event.dy;
              // Update window position directly (shared control)
              window.moveTo(x, y, 'os');
              // Also call callback if provided (for backward compat)
              if (onMove) {
                onMove(window.id, x, y);
              }
            }
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
          start() {
            isInteractingRef.current = true;
          },
          move(event) {
            // Apply size changes directly during resize
            const { width, height } = event.rect;
            event.target.style.width = `${width}px`;
            event.target.style.height = `${height}px`;
            // Don't call onResize during resize - it causes re-renders
          },
          end(event) {
            isInteractingRef.current = false;
            // Update size after resize completes
            const { width, height } = event.rect;
            // Update window size directly (shared control)
            window.resizeTo(width, height, 'os');
            // Also call callback if provided (for backward compat)
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
  }, [window.id, onFocus, onMove, onResize]); // Removed window.bounds.w and window.bounds.h

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
