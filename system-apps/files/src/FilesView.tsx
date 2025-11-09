import React, { useState, useEffect, useCallback } from 'react';
import { VfsImpl, Entry } from '@browser-os/fs';
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import { Toolbar, Button, ButtonGroup, Dialog, DialogActions, Input, Separator } from '@browser-os/ui';
import { Window } from '@browser-os/windowing';
import '@browser-os/ui/dist/ui.css';
import './Files.css';

interface FilesViewProps {
  window: Window;
  vfs: VfsImpl;
  initialPath?: string;
}

export const FilesView: React.FC<FilesViewProps> = ({ window, vfs, initialPath = 'vfs://documents/' }) => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [loading, setLoading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const dirEntries = await vfs.readdir(path);
      setEntries(dirEntries.sort((a, b) => {
        if (a.stat.type !== b.stat.type) {
          return a.stat.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }));
    } catch (error: any) {
      console.error('Failed to load directory:', error);
    } finally {
      setLoading(false);
    }
  }, [vfs]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const handleEntryClick = (entry: Entry) => {
    if (entry.stat.type === 'directory') {
      const newPath = entry.path.startsWith('vfs://')
        ? entry.path + '/'
        : `${currentPath}${entry.name}/`;
      setCurrentPath(newPath);
      setSelectedFiles(new Set());
    } else {
      // Toggle selection
      const fullPath = entry.path.startsWith('vfs://')
        ? entry.path
        : `${currentPath}${entry.name}`;
      setSelectedFiles(prev => {
        const next = new Set(prev);
        if (next.has(fullPath)) {
          next.delete(fullPath);
        } else {
          next.add(fullPath);
        }
        return next;
      });
    }
  };

  const handleUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 2) {
      parts.pop();
      setCurrentPath('vfs://' + parts.slice(1).join('/') + '/');
      setSelectedFiles(new Set());
    }
  };

  const handleNewFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const folderPath = currentPath.endsWith('/')
      ? currentPath + newFolderName.trim()
      : currentPath + '/' + newFolderName.trim();
    
    try {
      await vfs.write(folderPath + '/.dir', '');
      setShowNewFolderDialog(false);
      setNewFolderName('');
      loadDirectory(currentPath);
    } catch (error: any) {
      alert(`Failed to create folder: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!confirm(`Delete ${selectedFiles.size} item(s)?`)) return;
    
    for (const filePath of selectedFiles) {
      try {
        await vfs.rm(filePath, { recursive: true });
      } catch (error: any) {
        console.error(`Failed to delete ${filePath}:`, error);
      }
    }
    
    setSelectedFiles(new Set());
    loadDirectory(currentPath);
  };

  const handleRename = async (entry: Entry) => {
    const newName = prompt('Enter new name:', entry.name);
    if (!newName || newName === entry.name) return;
    
    const oldPath = entry.path.startsWith('vfs://')
      ? entry.path
      : `${currentPath}${entry.name}`;
    const newPath = currentPath.endsWith('/')
      ? currentPath + newName
      : currentPath + '/' + newName;
    
    try {
      // Read old file
      const content = await vfs.read(oldPath);
      // Write to new path
      await vfs.write(newPath, content);
      // Delete old file
      await vfs.rm(oldPath);
      loadDirectory(currentPath);
    } catch (error: any) {
      alert(`Failed to rename: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="files-app">
      <Toolbar>
        <Button onClick={handleUp} disabled={currentPath.split('/').filter(Boolean).length <= 2}>
          ↑ Up
        </Button>
        <Input
          type="text"
          value={currentPath}
          readOnly
          style={{ flex: 1 }}
        />
        <Button onClick={() => setShowNewFolderDialog(true)}>New Folder</Button>
        <Button onClick={handleDelete} disabled={selectedFiles.size === 0}>
          Delete
        </Button>
        <ButtonGroup variant="segmented">
          <Button
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
          >
            Grid
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
          >
            List
          </Button>
        </ButtonGroup>
      </Toolbar>

      <div className="files-content">
        {loading ? (
          <div className="files-loading">Loading...</div>
        ) : (
          <div className={`files-${viewMode}`}>
            {entries.map((entry) => {
              const fullPath = entry.path.startsWith('vfs://')
                ? entry.path
                : `${currentPath}${entry.name}`;
              const isSelected = selectedFiles.has(fullPath);
              
              return (
                <div
                  key={entry.path}
                  className={`files-entry ${entry.stat.type} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleEntryClick(entry)}
                  onDoubleClick={() => {
                    if (entry.stat.type === 'directory') {
                      handleEntryClick(entry);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Context menu would go here
                  }}
                >
                  <div className="files-entry-icon">
                    {entry.stat.type === 'directory' ? '📁' : '📄'}
                  </div>
                  <div className="files-entry-name">{entry.name}</div>
                  {viewMode === 'list' && (
                    <>
                      <div className="files-entry-size">
                        {entry.stat.type === 'file' ? formatFileSize(entry.stat.size) : '-'}
                      </div>
                      <div className="files-entry-date">{formatDate(entry.stat.mtime)}</div>
                    </>
                  )}
                </div>
              );
            })}
            {entries.length === 0 && (
              <div className="files-empty">No files or folders</div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={showNewFolderDialog}
        onClose={() => setShowNewFolderDialog(false)}
        title="New Folder"
      >
        <Input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleNewFolder();
            } else if (e.key === 'Escape') {
              setShowNewFolderDialog(false);
            }
          }}
        />
        <DialogActions>
          <Button onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleNewFolder}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

