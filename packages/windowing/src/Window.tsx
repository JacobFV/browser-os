import React, { useState, useRef, useEffect } from 'react';
import { Window } from './Window';
import interact from 'interactjs';

export interface WindowViewProps {
  window: Window;
  onClose: (winId: string) => void;
  onFocus: (winId: string) => void;
  onMove: (winId: string, x: number, y: number) => void;
  onResize: (winId: string, w: number, h: number) => void;
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
  const [transformOffset, setTransformOffset] = useState<{ x: number; y: number } | null>(null);
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
              // Update transform offset state for smooth movement
              setTransformOffset({ x: event.dx, y: event.dy });
            }
          },
          end(event) {
            isInteractingRef.current = false;
            setIsDragging(false);
            if (dragStartPosRef.current) {
              const x = dragStartPosRef.current.x + event.dx;
              const y = dragStartPosRef.current.y + event.dy;
              // Call callback to update window position (single source of truth)
              onMove(window.id, x, y);
              // Reset transform offset after callback
              setTransformOffset(null);
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
            // Call callback to update window size (single source of truth)
            onResize(window.id, width, height);
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
  }, [window, onFocus, onMove, onResize]);

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
    // Apply transform offset during drag for smooth movement
    transform: transformOffset ? `translate(${transformOffset.x}px, ${transformOffset.y}px)` : undefined,
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
