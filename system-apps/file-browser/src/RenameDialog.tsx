import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from './Dialog';

export interface RenameDialogProps {
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  currentName,
  onRename,
  onCancel,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleRename = () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    if (newName === currentName) {
      onCancel();
      return;
    }
    onRename(newName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Dialog title="Rename" onClose={onCancel}>
      <div className="dialog-input">
        <label>New name:</label>
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && <div className="dialog-error">{error}</div>}
      <div className="dialog-actions">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleRename} className="primary">
          Rename
        </button>
      </div>
    </Dialog>
  );
};

