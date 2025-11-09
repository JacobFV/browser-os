import React from 'react';
import { MenuBar as UIMenuBar, Menu, MenuItem } from '@browser-os/ui';
import '@browser-os/ui/dist/ui.css';

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
    <UIMenuBar>
      <Menu label="File">
        <MenuItem label="New" onClick={onNew} shortcut="Ctrl+N" />
        <MenuItem label="Open..." onClick={onOpen} shortcut="Ctrl+O" />
        <MenuItem separator />
        <MenuItem label="Save" onClick={onSave} shortcut="Ctrl+S" />
        <MenuItem label="Save As..." onClick={onSaveAs} shortcut="Ctrl+Shift+S" />
        <MenuItem separator />
        <MenuItem label="Close" onClick={onClose} />
      </Menu>
      <Menu label="Edit">
        <MenuItem label="Undo" shortcut="Ctrl+Z" />
        <MenuItem label="Redo" shortcut="Ctrl+Y" />
        <MenuItem separator />
        <MenuItem label="Cut" shortcut="Ctrl+X" />
        <MenuItem label="Copy" shortcut="Ctrl+C" />
        <MenuItem label="Paste" shortcut="Ctrl+V" />
      </Menu>
      <Menu label="Format">
        <MenuItem label="Bold" shortcut="Ctrl+B" />
        <MenuItem label="Italic" shortcut="Ctrl+I" />
        <MenuItem label="Underline" shortcut="Ctrl+U" />
      </Menu>
    </UIMenuBar>
  );
};

