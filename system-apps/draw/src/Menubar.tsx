import React, { useState, useEffect, useRef } from 'react';
import './Menubar.css';

export type ToolbarPosition = 'left' | 'bottom' | 'right';

export interface MenubarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExit: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomTo?: (scale: number) => void;
  onFitToWindow?: () => void;
  onActualSize?: () => void;
  toolbarPosition: ToolbarPosition;
  onToolbarPositionChange: (position: ToolbarPosition) => void;
}

export const Menubar: React.FC<MenubarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExit,
  onUndo,
  onRedo,
  onClear,
  onResetView,
  onZoomIn,
  onZoomOut,
  onZoomTo,
  onFitToWindow,
  onActualSize,
  toolbarPosition,
  onToolbarPositionChange,
}) => {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
        setIsEditMenuOpen(false);
        setIsViewMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            onNew();
            break;
          case 'o':
            event.preventDefault();
            onOpen();
            break;
          case 's':
            event.preventDefault();
            if (event.shiftKey) {
              onSaveAs();
            } else {
              onSave();
            }
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey && onRedo) {
              onRedo();
            } else if (onUndo) {
              onUndo();
            }
            break;
          case '=':
          case '+':
            event.preventDefault();
            if (onZoomIn) {
              onZoomIn();
            }
            break;
          case '-':
            event.preventDefault();
            if (onZoomOut) {
              onZoomOut();
            }
            break;
          case '0':
            event.preventDefault();
            if (onFitToWindow) {
              onFitToWindow();
            }
            break;
        }
      }
    };

    if (isFileMenuOpen || isEditMenuOpen || isViewMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFileMenuOpen, isEditMenuOpen, isViewMenuOpen, onNew, onOpen, onSave, onSaveAs, onUndo, onRedo, onZoomIn, onZoomOut, onFitToWindow]);

  return (
    <div className="menubar" ref={menuRef}>
      <div className="menubar-item">
        <button
          className="menubar-button"
          onClick={() => {
            setIsFileMenuOpen(!isFileMenuOpen);
            setIsEditMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
          onMouseEnter={() => {
            setIsFileMenuOpen(true);
            setIsEditMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
        >
          File
        </button>
        {isFileMenuOpen && (
          <div className="menubar-menu">
            <button className="menubar-menu-item" onClick={onNew}>
              New <span className="menubar-shortcut">Ctrl+N</span>
            </button>
            <button className="menubar-menu-item" onClick={onOpen}>
              Open <span className="menubar-shortcut">Ctrl+O</span>
            </button>
            <div className="menubar-menu-separator" />
            <button className="menubar-menu-item" onClick={onSave}>
              Save <span className="menubar-shortcut">Ctrl+S</span>
            </button>
            <button className="menubar-menu-item" onClick={onSaveAs}>
              Save As <span className="menubar-shortcut">Ctrl+Shift+S</span>
            </button>
            <div className="menubar-menu-separator" />
            <button className="menubar-menu-item" onClick={onExit}>
              Exit
            </button>
          </div>
        )}
      </div>

      <div className="menubar-item">
        <button
          className="menubar-button"
          onClick={() => {
            setIsEditMenuOpen(!isEditMenuOpen);
            setIsFileMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
          onMouseEnter={() => {
            setIsEditMenuOpen(true);
            setIsFileMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
        >
          Edit
        </button>
        {isEditMenuOpen && (
          <div className="menubar-menu">
            {onUndo && (
              <button className="menubar-menu-item" onClick={onUndo}>
                Undo <span className="menubar-shortcut">Ctrl+Z</span>
              </button>
            )}
            {onRedo && (
              <button className="menubar-menu-item" onClick={onRedo}>
                Redo <span className="menubar-shortcut">Ctrl+Shift+Z</span>
              </button>
            )}
            {(onUndo || onRedo) && <div className="menubar-menu-separator" />}
            {onClear && (
              <button className="menubar-menu-item" onClick={onClear}>
                Clear Canvas
              </button>
            )}
          </div>
        )}
      </div>

      <div className="menubar-item">
        <button
          className="menubar-button"
          onClick={() => {
            setIsViewMenuOpen(!isViewMenuOpen);
            setIsFileMenuOpen(false);
            setIsEditMenuOpen(false);
          }}
          onMouseEnter={() => {
            setIsViewMenuOpen(true);
            setIsFileMenuOpen(false);
            setIsEditMenuOpen(false);
          }}
        >
          View
        </button>
        {isViewMenuOpen && (
          <div className="menubar-menu">
            {onZoomIn && (
              <button className="menubar-menu-item" onClick={onZoomIn}>
                Zoom In <span className="menubar-shortcut">Ctrl++</span>
              </button>
            )}
            {onZoomOut && (
              <button className="menubar-menu-item" onClick={onZoomOut}>
                Zoom Out <span className="menubar-shortcut">Ctrl+-</span>
              </button>
            )}
            {(onZoomIn || onZoomOut) && <div className="menubar-menu-separator" />}
            {onFitToWindow && (
              <button className="menubar-menu-item" onClick={onFitToWindow}>
                Fit to Window <span className="menubar-shortcut">Ctrl+0</span>
              </button>
            )}
            {onActualSize && (
              <button className="menubar-menu-item" onClick={onActualSize}>
                Actual Size (100%)
              </button>
            )}
            {(onFitToWindow || onActualSize) && <div className="menubar-menu-separator" />}
            {onZoomTo && (
              <>
                <div className="menubar-menu-item" style={{ cursor: 'default', fontWeight: 600 }}>
                  Zoom Level
                </div>
                <button className="menubar-menu-item" onClick={() => onZoomTo(0.25)}>
                  25%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(0.5)}>
                  50%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(0.75)}>
                  75%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(1)}>
                  100%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(1.5)}>
                  150%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(2)}>
                  200%
                </button>
                <button className="menubar-menu-item" onClick={() => onZoomTo(4)}>
                  400%
                </button>
                <div className="menubar-menu-separator" />
              </>
            )}
            {onResetView && (
              <>
                <button className="menubar-menu-item" onClick={onResetView}>
                  Reset View
                </button>
                <div className="menubar-menu-separator" />
              </>
            )}
            <div className="menubar-menu-item" style={{ cursor: 'default', fontWeight: 600 }}>
              Toolbar Position
            </div>
            <button
              className={`menubar-menu-item ${toolbarPosition === 'left' ? 'menubar-menu-item-checked' : ''}`}
              onClick={() => onToolbarPositionChange('left')}
            >
              Left {toolbarPosition === 'left' && '✓'}
            </button>
            <button
              className={`menubar-menu-item ${toolbarPosition === 'bottom' ? 'menubar-menu-item-checked' : ''}`}
              onClick={() => onToolbarPositionChange('bottom')}
            >
              Bottom {toolbarPosition === 'bottom' && '✓'}
            </button>
            <button
              className={`menubar-menu-item ${toolbarPosition === 'right' ? 'menubar-menu-item-checked' : ''}`}
              onClick={() => onToolbarPositionChange('right')}
            >
              Right {toolbarPosition === 'right' && '✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

