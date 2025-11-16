import React, { useState, useEffect } from 'react';
import type { FileSystem } from '@browser-os/fs';
import type { FileMetadata } from '@browser-os/schemas';
import { Dialog } from './Dialog';
import './Dialog.css';

export interface OpenDialogProps {
  fs: FileSystem;
  onOpen: (path: string) => void;
  onCancel: () => void;
}

export const OpenDialog: React.FC<OpenDialogProps> = ({
  fs,
  onOpen,
  onCancel,
}) => {
  const [currentDir, setCurrentDir] = useState('/home/user/Documents');
  const [entries, setEntries] = useState<FileMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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
      const metadataPromises = dirEntries.map(async (name) => {
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
    setSelectedFile(null);
  };

  const handleParentClick = () => {
    if (currentDir === '/') return;
    const parts = currentDir.split('/').filter((p) => p);
    parts.pop();
    setCurrentDir(parts.length === 0 ? '/' : '/' + parts.join('/'));
    setSelectedFile(null);
  };

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
  };

  const handleOpen = () => {
    if (selectedFile) {
      onOpen(selectedFile);
    }
  };

  const handleDoubleClick = (entry: FileMetadata) => {
    if (entry.type === 'directory') {
      handleDirectoryClick(entry.path);
    } else {
      onOpen(entry.path);
    }
  };

  return (
    <Dialog title="Open File" onClose={onCancel}>
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
              entries.map((entry) => {
                if (entry.type === 'directory') {
                  return (
                    <div
                      key={entry.path}
                      className="file-dialog-item directory"
                      onClick={() => handleDirectoryClick(entry.path)}
                      onDoubleClick={() => handleDoubleClick(entry)}
                    >
                      <span className="file-dialog-icon">📁</span>
                      <span className="file-dialog-name">{entry.path.split('/').pop()}</span>
                    </div>
                  );
                } else if (entry.path.endsWith('.txt')) {
                  return (
                    <div
                      key={entry.path}
                      className={`file-dialog-item file ${selectedFile === entry.path ? 'selected' : ''}`}
                      onClick={() => handleFileClick(entry.path)}
                      onDoubleClick={() => handleDoubleClick(entry)}
                    >
                      <span className="file-dialog-icon">📄</span>
                      <span className="file-dialog-name">{entry.path.split('/').pop()}</span>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>
        </div>
        {error && <div className="file-dialog-error">{error}</div>}
        <div className="file-dialog-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleOpen} className="primary" disabled={!selectedFile}>
            Open
          </button>
        </div>
      </div>
    </Dialog>
  );
};

