import React, { useState, useEffect, useRef } from 'react';
import './Menubar.css';

export interface MenubarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExit: () => void;
}

export const Menubar: React.FC<MenubarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExit,
}) => {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
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
        }
      }
    };

    if (isFileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFileMenuOpen, onNew, onOpen, onSave, onSaveAs]);

  return (
    <div className="menubar" ref={menuRef}>
      <div className="menubar-item">
        <button
          className="menubar-button"
          onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
          onMouseEnter={() => setIsFileMenuOpen(true)}
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
    </div>
  );
};

