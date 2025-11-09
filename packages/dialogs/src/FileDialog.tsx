import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Button, Input } from '@browser-os/ui';
import { vfs, Entry } from '@browser-os/fs';
import { FileDialogOptions, FileDialogResult } from './FileDialog.types';
import './FileDialog.css';

export interface FileDialogProps extends FileDialogOptions {
  open: boolean;
  onClose: () => void;
  onConfirm: (result: FileDialogResult) => void;
}

export const FileDialog: React.FC<FileDialogProps> = ({
  open,
  onClose,
  onConfirm,
  mode,
  title,
  filters = [],
  defaultPath,
  allowMultiple = false,
}) => {
  const [currentPath, setCurrentPath] = useState<string>(defaultPath || 'vfs://documents/');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const dirEntries = await vfs.readdir(path);
      // Convert relative paths to full URIs
      const entriesWithUris = dirEntries.map((entry) => {
        const fullUri = entry.path.startsWith('vfs://')
          ? entry.path
          : `${path}${path.endsWith('/') ? '' : '/'}${entry.name}`;
        return {
          ...entry,
          path: fullUri,
        };
      });
      
      // Filter entries based on file type filters if in open mode
      let filtered = entriesWithUris;
      if (mode === 'open' && filters.length > 0 && filters[0].extensions.length > 0) {
        filtered = entriesWithUris.filter((entry) => {
          if (entry.stat.type === 'directory') return true;
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';
          return filters.some((filter) => filter.extensions.some((e) => e.toLowerCase() === ext || e === '*'));
        });
      }
      setEntries(filtered.sort((a, b) => {
        // Directories first, then files
        if (a.stat.type !== b.stat.type) {
          return a.stat.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load directory');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [mode, filters]);

  useEffect(() => {
    if (open) {
      if (defaultPath && currentPath !== defaultPath) {
        setCurrentPath(defaultPath);
      }
      if (currentPath) {
        loadDirectory(currentPath);
      }
      // Reset state when dialog opens
      setSelectedFiles([]);
      setFileName('');
      setError(null);
    }
  }, [open, defaultPath, currentPath, loadDirectory]);

  const handleEntryClick = (entry: Entry) => {
    if (entry.stat.type === 'directory') {
      // Navigate into directory
      // Entry.path from mem driver is relative, need to construct full URI
      const newPath = entry.path.startsWith('vfs://') 
        ? entry.path + '/'
        : `${currentPath}${entry.name}/`;
      setCurrentPath(newPath);
      setSelectedFiles([]);
    } else {
      // Select file
      if (mode === 'save') {
        setFileName(entry.name);
      } else {
        // Construct full URI for file
        const fullPath = entry.path.startsWith('vfs://') 
          ? entry.path 
          : `${currentPath}${entry.name}`;
        if (allowMultiple) {
          setSelectedFiles((prev) =>
            prev.includes(fullPath) ? prev.filter((p) => p !== fullPath) : [...prev, fullPath]
          );
        } else {
          setSelectedFiles([fullPath]);
          setFileName(entry.name);
        }
      }
    }
  };

  const handleUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 2) {
      // Remove last part (file/dir name)
      parts.pop();
      const newPath = 'vfs://' + parts.slice(1).join('/') + '/';
      setCurrentPath(newPath);
      setSelectedFiles([]);
      setFileName('');
    }
  };

  const handleConfirm = () => {
    if (mode === 'save') {
      if (!fileName.trim()) {
        setError('Please enter a file name');
        return;
      }
      // Ensure file has extension if filter is selected
      let finalFileName = fileName.trim();
      if (filters.length > 0 && filters[0].extensions.length > 0 && filters[0].extensions[0] !== '*') {
        const hasExt = finalFileName.includes('.');
        if (!hasExt && filters[0].extensions[0]) {
          finalFileName += '.' + filters[0].extensions[0];
        }
      }
      const fullPath = currentPath.endsWith('/') ? currentPath + finalFileName : currentPath + '/' + finalFileName;
      onConfirm({ canceled: false, filePaths: [fullPath] });
    } else {
      if (selectedFiles.length === 0) {
        setError('Please select a file');
        return;
      }
      onConfirm({ canceled: false, filePaths: selectedFiles });
    }
  };

  const handleCancel = () => {
    onConfirm({ canceled: true, filePaths: [] });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (!open) return null;

  const canGoUp = currentPath.split('/').filter(Boolean).length > 2;
  const hasSelection = mode === 'save' ? fileName.trim().length > 0 : selectedFiles.length > 0;

  return (
    <Dialog open={open} onClose={handleCancel} title={title || (mode === 'save' ? 'Save File' : 'Open File')}>
      <div className="file-dialog">
        <div className="file-dialog-toolbar">
          <Button variant="ghost" size="sm" onClick={handleUp} disabled={!canGoUp}>
            ↑ Up
          </Button>
          <div className="file-dialog-path">
            <Input value={currentPath} readOnly className="path-input" />
          </div>
        </div>

        <div className="file-dialog-content">
          {loading ? (
            <div className="file-dialog-loading">Loading...</div>
          ) : error ? (
            <div className="file-dialog-error">{error}</div>
          ) : (
            <div className="file-dialog-list">
              {entries.map((entry) => {
                const fullPath = entry.path.startsWith('vfs://') ? entry.path : `${currentPath}${entry.name}`;
                const isSelected = selectedFiles.includes(fullPath) || (mode === 'save' && fileName === entry.name);
                return (
                  <div
                    key={entry.path}
                    className={`file-dialog-entry ${entry.stat.type} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleEntryClick(entry)}
                    onDoubleClick={() => {
                      if (entry.stat.type === 'file') {
                        handleConfirm();
                      }
                    }}
                  >
                    <span className="file-dialog-icon">
                      {entry.stat.type === 'directory' ? '📁' : '📄'}
                    </span>
                    <span className="file-dialog-name">{entry.name}</span>
                    {entry.stat.type === 'file' && (
                      <>
                        <span className="file-dialog-size">{formatFileSize(entry.stat.size)}</span>
                        <span className="file-dialog-date">{formatDate(entry.stat.mtime)}</span>
                      </>
                    )}
                  </div>
                );
              })}
              {entries.length === 0 && <div className="file-dialog-empty">No files or folders</div>}
            </div>
          )}
        </div>

        <div className="file-dialog-footer">
          {mode === 'save' && (
          <div className="file-dialog-filename">
            <Input
              label="File name:"
              value={fileName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)}
              placeholder="Enter file name"
              autoFocus
            />
          </div>
          )}
          {filters.length > 0 && (
            <div className="file-dialog-filters">
              <select>
                {filters.map((filter, idx) => (
                  <option key={idx} value={idx}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="file-dialog-actions">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!hasSelection}>
              {mode === 'save' ? 'Save' : 'Open'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

