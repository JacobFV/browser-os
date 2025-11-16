import React from 'react';
import { Dialog } from './Dialog';

export interface DeleteConfirmDialogProps {
  name: string;
  isDirectory: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  name,
  isDirectory,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog title="Delete" onClose={onCancel}>
      <div className="dialog-message">
        Are you sure you want to delete {isDirectory ? 'the folder' : 'the file'} <strong>{name}</strong>?
        {isDirectory && <div style={{ marginTop: '8px', color: '#c00' }}>This will delete all contents inside the folder.</div>}
      </div>
      <div className="dialog-actions">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} className="primary" style={{ background: '#c00', borderColor: '#c00' }}>
          Delete
        </button>
      </div>
    </Dialog>
  );
};

