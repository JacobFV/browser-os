import React from 'react';
import './MenuBar.css';

interface MenuBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onClose: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onClose,
}) => {
  return (
    <div className="menu-bar">
      <div className="menu-item">
        <span className="menu-label">File</span>
        <div className="menu-dropdown">
          <div className="menu-option" onClick={onNew}>
            New <span className="menu-shortcut">Ctrl+N</span>
          </div>
          <div className="menu-option" onClick={onOpen}>
            Open... <span className="menu-shortcut">Ctrl+O</span>
          </div>
          <div className="menu-separator" />
          <div className="menu-option" onClick={onSave}>
            Save <span className="menu-shortcut">Ctrl+S</span>
          </div>
          <div className="menu-option" onClick={onSaveAs}>
            Save As... <span className="menu-shortcut">Ctrl+Shift+S</span>
          </div>
          <div className="menu-separator" />
          <div className="menu-option" onClick={onClose}>
            Close
          </div>
        </div>
      </div>
      <div className="menu-item">
        <span className="menu-label">Edit</span>
        <div className="menu-dropdown">
          <div className="menu-option">
            Undo <span className="menu-shortcut">Ctrl+Z</span>
          </div>
          <div className="menu-option">
            Redo <span className="menu-shortcut">Ctrl+Y</span>
          </div>
          <div className="menu-separator" />
          <div className="menu-option">
            Cut <span className="menu-shortcut">Ctrl+X</span>
          </div>
          <div className="menu-option">
            Copy <span className="menu-shortcut">Ctrl+C</span>
          </div>
          <div className="menu-option">
            Paste <span className="menu-shortcut">Ctrl+V</span>
          </div>
        </div>
      </div>
      <div className="menu-item">
        <span className="menu-label">Format</span>
        <div className="menu-dropdown">
          <div className="menu-option">Bold <span className="menu-shortcut">Ctrl+B</span></div>
          <div className="menu-option">Italic <span className="menu-shortcut">Ctrl+I</span></div>
          <div className="menu-option">Underline <span className="menu-shortcut">Ctrl+U</span></div>
        </div>
      </div>
    </div>
  );
};

