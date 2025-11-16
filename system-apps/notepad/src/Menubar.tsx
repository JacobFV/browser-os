import React, { useState, useEffect, useRef } from 'react';
import './Menubar.css';

export interface MenubarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onToggleWordWrap: () => void;
  wordWrap: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const Menubar: React.FC<MenubarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExit,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onToggleWordWrap,
  wordWrap,
  canUndo,
  canRedo,
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
            if (event.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case 'y':
            event.preventDefault();
            onRedo();
            break;
          case 'x':
            event.preventDefault();
            onCut();
            break;
          case 'c':
            event.preventDefault();
            onCopy();
            break;
          case 'v':
            event.preventDefault();
            onPaste();
            break;
          case 'a':
            event.preventDefault();
            onSelectAll();
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
  }, [isFileMenuOpen, isEditMenuOpen, isViewMenuOpen, onNew, onOpen, onSave, onSaveAs, onUndo, onRedo, onCut, onCopy, onPaste, onSelectAll]);

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
            <button 
              className="menubar-menu-item" 
              onClick={onUndo}
              disabled={!canUndo}
            >
              Undo <span className="menubar-shortcut">Ctrl+Z</span>
            </button>
            <button 
              className="menubar-menu-item" 
              onClick={onRedo}
              disabled={!canRedo}
            >
              Redo <span className="menubar-shortcut">Ctrl+Y</span>
            </button>
            <div className="menubar-menu-separator" />
            <button className="menubar-menu-item" onClick={onCut}>
              Cut <span className="menubar-shortcut">Ctrl+X</span>
            </button>
            <button className="menubar-menu-item" onClick={onCopy}>
              Copy <span className="menubar-shortcut">Ctrl+C</span>
            </button>
            <button className="menubar-menu-item" onClick={onPaste}>
              Paste <span className="menubar-shortcut">Ctrl+V</span>
            </button>
            <div className="menubar-menu-separator" />
            <button className="menubar-menu-item" onClick={onSelectAll}>
              Select All <span className="menubar-shortcut">Ctrl+A</span>
            </button>
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
            <button 
              className={`menubar-menu-item ${wordWrap ? 'menubar-menu-item-checked' : ''}`}
              onClick={onToggleWordWrap}
            >
              Word Wrap {wordWrap && '✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

