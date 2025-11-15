import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Window as WindowType } from '@browser-os/schemas';
import './Window.css';

export interface WindowProps {
  window: WindowType;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  onMove?: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  children: React.ReactNode;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const Window: React.FC<WindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  onFocus,
  onMove,
  onResize,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (window.state === 'minimized') return;
      if (onFocus) onFocus();
      if (!window.movable) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.x,
        y: e.clientY - window.y,
      });
      e.preventDefault();
    },
    [window.x, window.y, window.state, window.movable, onFocus]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      if (window.state === 'minimized' || window.state === 'maximized') return;
      if (!window.resizable) return;

      setIsResizing(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: window.width,
        height: window.height,
      });
      e.preventDefault();
      e.stopPropagation();
    },
    [window.width, window.height, window.state, window.resizable]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onMove) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onMove(newX, newY);
      } else if (isResizing && onResize && onMove) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = window.x;
        let newY = window.y;

        if (isResizing.includes('e')) {
          newWidth = Math.max(window.minWidth, resizeStart.width + deltaX);
          if (window.maxWidth) newWidth = Math.min(window.maxWidth, newWidth);
        }
        if (isResizing.includes('w')) {
          const widthChange = resizeStart.width - Math.max(window.minWidth, resizeStart.width - deltaX);
          newWidth = Math.max(window.minWidth, resizeStart.width - deltaX);
          if (window.maxWidth) newWidth = Math.min(window.maxWidth, newWidth);
          newX = window.x + (resizeStart.width - newWidth);
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(window.minHeight, resizeStart.height + deltaY);
          if (window.maxHeight) newHeight = Math.min(window.maxHeight, newHeight);
        }
        if (isResizing.includes('n')) {
          const heightChange = resizeStart.height - Math.max(window.minHeight, resizeStart.height - deltaY);
          newHeight = Math.max(window.minHeight, resizeStart.height - deltaY);
          if (window.maxHeight) newHeight = Math.min(window.maxHeight, newHeight);
          newY = window.y + (resizeStart.height - newHeight);
        }

        onResize(newWidth, newHeight);
        if (newX !== window.x || newY !== window.y) {
          onMove(newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, window, onMove, onResize]);

  if (window.state === 'minimized') {
    return null;
  }

  const isMaximized = window.state === 'maximized';
  const style: React.CSSProperties = {
    position: 'absolute',
    left: isMaximized ? 0 : `${window.x}px`,
    top: isMaximized ? 0 : `${window.y}px`,
    width: isMaximized ? '100%' : `${window.width}px`,
    height: isMaximized ? '100%' : `${window.height}px`,
    zIndex: window.zIndex,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div
      ref={windowRef}
      className="window"
      style={style}
      onClick={onFocus}
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div
        className="window-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: window.movable ? 'move' : 'default' }}
      >
        <span className="window-title">{window.title}</span>
        <div className="window-controls">
          {window.minimizable && (
            <button className="window-control minimize" onClick={onMinimize} title="Minimize">
              −
            </button>
          )}
          {window.maximizable && (
            <button
              className="window-control maximize"
              onClick={isMaximized ? onRestore : onMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '❐' : '□'}
            </button>
          )}
          {window.closable && (
            <button className="window-control close" onClick={onClose} title="Close">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="window-content" style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>

      {/* Resize handles */}
      {window.resizable && !isMaximized && (
        <>
          <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
          <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
          <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
        </>
      )}
    </div>
  );
};

