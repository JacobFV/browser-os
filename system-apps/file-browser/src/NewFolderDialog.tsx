import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from './Dialog';

export interface NewFolderDialogProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
}

export const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  onCreate,
  onCancel,
}) => {
  const [folderName, setFolderName] = useState('New Folder');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleCreate = () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    onCreate(folderName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Dialog title="New Folder" onClose={onCancel}>
      <div className="dialog-input">
        <label>Folder name:</label>
        <input
          ref={inputRef}
          type="text"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && <div className="dialog-error">{error}</div>}
      <div className="dialog-actions">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleCreate} className="primary">
          Create
        </button>
      </div>
    </Dialog>
  );
};

