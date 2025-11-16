import React, { useState, useEffect } from 'react';
import type { FileSystem } from '@browser-os/fs';
import type { FileMetadata } from '@browser-os/schemas';
import type { EventBus } from '@browser-os/events';
import { Dialog } from './Dialog';
import './Dialog.css';

export interface SaveDialogProps {
  fs: FileSystem;
  appId: string;
  eventBus: EventBus;
  currentPath?: string;
  onSave: (path: string) => void;
  onCancel: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  fs,
  appId,
  eventBus,
  currentPath,
  onSave,
  onCancel,
}) => {
  const [currentDir, setCurrentDir] = useState('/home/user/Documents');
  const [fileName, setFileName] = useState(currentPath?.split('/').pop() || '');
  const [entries, setEntries] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDirectory();
  }, [currentDir]);

  const loadDirectory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure directory exists
      if (!(await fs.exists(currentDir))) {
        await fs.mkdir(currentDir, { recursive: true });
      }

      const dirEntries = await fs.readdir(currentDir);
      const metadataPromises = dirEntries.map(async (name: string) => {
        const fullPath = currentDir === '/' ? `/${name}` : `${currentDir}/${name}`;
        try {
          return await fs.stat(fullPath);
        } catch {
          return null;
        }
      });

      const metadataResults = await Promise.all(metadataPromises);
      const validEntries = metadataResults.filter((m: FileMetadata | null): m is FileMetadata => m !== null);
      setEntries(validEntries.sort((a: FileMetadata, b: FileMetadata) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.path.localeCompare(b.path);
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectoryClick = (path: string) => {
    setCurrentDir(path);
  };

  const handleParentClick = () => {
    if (currentDir === '/') return;
    const parts = currentDir.split('/').filter((p) => p);
    parts.pop();
    setCurrentDir(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    const fullPath = currentDir === '/' ? `/${fileName}` : `${currentDir}/${fileName}`;
    const finalPath = fullPath.endsWith('.txt') ? fullPath : `${fullPath}.txt`;

    try {
      // Ensure directory exists
      if (!(await fs.exists(currentDir))) {
        await fs.mkdir(currentDir, { recursive: true });
      }
      onSave(finalPath);
      // Emit file opened event (for save, we also track it as opened)
      eventBus.emit('app:file:opened', { appId, filePath: finalPath }, { source: 'notepad' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <Dialog title="Save File" onClose={onCancel}>
      <div className="file-dialog">
        <div className="file-dialog-browser">
          <div className="file-dialog-path">
            <button
              className="file-dialog-nav"
              onClick={handleParentClick}
              disabled={currentDir === '/'}
            >
              ↑ Up
            </button>
            <span className="file-dialog-current-path">{currentDir}</span>
          </div>
          <div className="file-dialog-list">
            {loading ? (
              <div className="file-dialog-loading">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="file-dialog-empty">Empty directory</div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.path}
                  className={`file-dialog-item ${entry.type}`}
                  onClick={() => {
                    if (entry.type === 'directory') {
                      handleDirectoryClick(entry.path);
                    }
                  }}
                >
                  <span className="file-dialog-icon">
                    {entry.type === 'directory' ? '📁' : '📄'}
                  </span>
                  <span className="file-dialog-name">{entry.path.split('/').pop()}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="file-dialog-input">
          <label>File name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
            placeholder="Enter file name"
            autoFocus
          />
        </div>
        {error && <div className="file-dialog-error">{error}</div>}
        <div className="file-dialog-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleSave} className="primary">
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
};

