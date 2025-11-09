import React, { useRef, useEffect, useState } from 'react';
import interact from 'interactjs';

export interface WindowProps {
  title?: string;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  className?: string;
}

export const Window: React.FC<WindowProps> = ({
  title = 'Window',
  children,
  width = 600,
  height = 400,
  x: initialX,
  y: initialY,
  onClose,
  onMinimize,
  onMaximize,
  onPositionChange,
  className = '',
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX ?? 0, y: initialY ?? 0 });
  const interactInstanceRef = useRef<ReturnType<typeof interact> | null>(null);

  // Update position when props change (but don't re-run interact setup)
  useEffect(() => {
    if (initialX !== undefined || initialY !== undefined) {
      const newX = initialX ?? position.x;
      const newY = initialY ?? position.y;
      setPosition({ x: newX, y: newY });
      
      // Update the DOM directly
      const element = windowRef.current;
      if (element) {
        element.setAttribute('data-x', newX.toString());
        element.setAttribute('data-y', newY.toString());
        element.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    }
  }, [initialX, initialY]);

  // Initialize interact.js once on mount
  useEffect(() => {
    const element = windowRef.current;
    if (!element) return;

    const titlebar = element.querySelector('.browser-os-window__titlebar') as HTMLElement;
    if (!titlebar) return;

    // Get parent container bounds
    const getParentBounds = () => {
      const parent = element.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        return {
          left: 0,
          top: 0,
          right: rect.width,
          bottom: rect.height,
        };
      }
      return {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
    };

    // Initialize position attributes
    const currentX = initialX ?? position.x;
    const currentY = initialY ?? position.y;
    element.setAttribute('data-x', currentX.toString());
    element.setAttribute('data-y', currentY.toString());
    element.style.transform = `translate(${currentX}px, ${currentY}px)`;

    // Set up interact.js with handle restriction
    interactInstanceRef.current = interact(element)
      .draggable({
        allowFrom: titlebar, // Use element reference instead of CSS selector
        listeners: {
          start(event) {
            // Prevent dragging if clicking directly on a button
            const target = event.target as HTMLElement;
            if (target.closest('.browser-os-window__control')) {
              event.interaction.stop();
              return;
            }
          },
          move(event) {
            const target = event.target as HTMLElement;
            const x = (parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y') || '0') || 0) + event.dy;

            // Constrain to parent container
            const bounds = getParentBounds();
            const maxX = bounds.right - target.offsetWidth;
            const maxY = bounds.bottom - target.offsetHeight;
            const constrainedX = Math.max(bounds.left, Math.min(x, maxX));
            const constrainedY = Math.max(bounds.top, Math.min(y, maxY));

            target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
            target.setAttribute('data-x', constrainedX.toString());
            target.setAttribute('data-y', constrainedY.toString());

            setPosition({ x: constrainedX, y: constrainedY });
            onPositionChange?.(constrainedX, constrainedY);
          },
        },
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: (targetElement: unknown) => {
              const elem = targetElement as HTMLElement;
              const parent = elem?.parentElement;
              if (parent) {
                const rect = parent.getBoundingClientRect();
                return {
                  left: 0,
                  top: 0,
                  right: rect.width,
                  bottom: rect.height,
                };
              }
              return {
                left: 0,
                top: 0,
                right: window.innerWidth,
                bottom: window.innerHeight,
              };
            },
            endOnly: false,
          }),
        ],
      });

    return () => {
      if (interactInstanceRef.current) {
        interactInstanceRef.current.unset();
        interactInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount

  return (
    <div
      ref={windowRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: '#c0c0c0',
        border: '2px outset #c0c0c0',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        fontFamily: "'MS Sans Serif', sans-serif",
      }}
    >
      <div
        className="browser-os-window__titlebar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, #008080, #004080)',
          color: 'white',
          padding: '2px 4px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'move',
          userSelect: 'none',
          minHeight: '18px',
          flexShrink: 0,
        }}
      >
        <div
          className="browser-os-window__title"
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <div
          className="browser-os-window__controls"
          style={{
            display: 'flex',
            gap: '2px',
          }}
        >
          {onMinimize && (
            <button
              className="browser-os-window__control browser-os-window__control--minimize"
              onClick={onMinimize}
              aria-label="Minimize"
              style={{
                width: '16px',
                height: '14px',
                border: '1px outset #c0c0c0',
                background: '#c0c0c0',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4d0c8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#c0c0c0';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.borderStyle = 'inset';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.borderStyle = 'outset';
              }}
            >
              −
            </button>
          )}
          {onMaximize && (
            <button
              className="browser-os-window__control browser-os-window__control--maximize"
              onClick={onMaximize}
              aria-label="Maximize"
              style={{
                width: '16px',
                height: '14px',
                border: '1px outset #c0c0c0',
                background: '#c0c0c0',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4d0c8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#c0c0c0';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.borderStyle = 'inset';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.borderStyle = 'outset';
              }}
            >
              □
            </button>
          )}
          {onClose && (
            <button
              className="browser-os-window__control browser-os-window__control--close"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: '16px',
                height: '14px',
                border: '1px outset #c0c0c0',
                background: '#c0c0c0',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: 'bold',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4d0c8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#c0c0c0';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.borderStyle = 'inset';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.borderStyle = 'outset';
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div
        className="browser-os-window__content"
        style={{
          flex: 1,
          background: 'white',
          padding: '8px',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

