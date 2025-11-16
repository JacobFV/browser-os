import React, { useEffect, useRef } from 'react';
import type { FileMetadata } from '@browser-os/schemas';
import './ContextMenu.css';

export interface ContextMenuProps {
  entry: FileMetadata | null;
  x: number;
  y: number;
  onClose: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onProperties: () => void;
  onCopyPath: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  entry,
  x,
  y,
  onClose,
  onOpen,
  onRename,
  onDelete,
  onProperties,
  onCopyPath,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!entry) return null;

  const isDirectory = entry.type === 'directory';

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {!isDirectory && (
        <button className="context-menu-item" onClick={onOpen}>
          Open
        </button>
      )}
      {isDirectory && (
        <button className="context-menu-item" onClick={onOpen}>
          Open in new window
        </button>
      )}
      <div className="context-menu-separator" />
      <button className="context-menu-item" onClick={onRename}>
        Rename
      </button>
      <button className="context-menu-item" onClick={onDelete}>
        Delete
      </button>
      <div className="context-menu-separator" />
      <button className="context-menu-item" onClick={onProperties}>
        Properties
      </button>
      <button className="context-menu-item" onClick={onCopyPath}>
        Copy path
      </button>
    </div>
  );
};

