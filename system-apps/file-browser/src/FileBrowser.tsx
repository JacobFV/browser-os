import React, { useState, useEffect, useRef } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import type { FileMetadata } from '@browser-os/schemas';
import { Toolbar, type ViewMode } from './Toolbar';
import { FileList, type SortField, type SortDirection } from './FileList';
import { ContextMenu } from './ContextMenu';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { NewFolderDialog } from './NewFolderDialog';
import { loadViewMetadata, saveViewMetadata, isHiddenMetadataFile } from './ViewMetadata';
import './FileBrowser.css';

export interface FileBrowserProps {
  windowId: string;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({ windowId }) => {
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home/user/Documents');
  const [entries, setEntries] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [itemScale, setItemScale] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [itemPositions, setItemPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const positionSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation history
  const [history, setHistory] = useState<string[]>(['/home/user/Documents']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Context menu
  const [contextMenuEntry, setContextMenuEntry] = useState<FileMetadata | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  
  // Dialogs
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [dialogEntry, setDialogEntry] = useState<FileMetadata | null>(null);

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);
        
        // Ensure Documents directory exists
        if (!(await filesystem.exists('/home/user/Documents'))) {
          await filesystem.mkdir('/home/user/Documents', { recursive: true });
        }
        
        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[FileBrowser] Failed to initialize filesystem:', error);
        setError('Failed to initialize filesystem');
      }
    };

    initFS();
  }, []);

  // Load directory contents and view metadata
  useEffect(() => {
    if (fs && isInitialized) {
      loadDirectory();
      loadViewPreferences();
    }
  }, [fs, isInitialized, currentPath]);

  const loadViewPreferences = async () => {
    if (!fs) return;
    try {
      const metadata = await loadViewMetadata(fs, currentPath);
      if (metadata) {
        if (metadata.viewMode) setViewMode(metadata.viewMode);
        if (metadata.itemScale !== undefined) setItemScale(metadata.itemScale);
        if (metadata.sortField) setSortField(metadata.sortField);
        if (metadata.sortDirection) setSortDirection(metadata.sortDirection);
        if (metadata.itemPositions) {
          setItemPositions(new Map(Object.entries(metadata.itemPositions)));
        }
      } else {
        // Reset to defaults if no metadata
        setViewMode('details');
        setItemScale(1);
        setSortField('name');
        setSortDirection('asc');
        setItemPositions(new Map());
      }
    } catch (error) {
      console.error('[FileBrowser] Failed to load view preferences:', error);
    }
  };

  const loadDirectory = async () => {
    if (!fs) return;
    
    setLoading(true);
    setError(null);
    try {
      // Ensure directory exists
      if (!(await fs.exists(currentPath))) {
        await fs.mkdir(currentPath, { recursive: true });
      }

      const dirEntries = await fs.readdir(currentPath);
      // Filter out hidden metadata files
      const visibleEntries = dirEntries.filter((name: string) => !isHiddenMetadataFile(name));
      const metadataPromises = visibleEntries.map(async (name: string) => {
        const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        try {
          return await fs.stat(fullPath);
        } catch {
          return null;
        }
      });

      const metadataResults = await Promise.all(metadataPromises);
      const validEntries = metadataResults.filter((m: FileMetadata | null): m is FileMetadata => m !== null);
      
      // Apply search filter
      let filteredEntries = validEntries;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredEntries = validEntries.filter((entry) => {
          const name = entry.path.split('/').pop() || '';
          return name.toLowerCase().includes(query);
        });
      }
      
      // Sort entries
      const sortedEntries = [...filteredEntries].sort((a: FileMetadata, b: FileMetadata) => {
        let comparison = 0;
        
        if (sortField === 'name') {
          const nameA = a.path.split('/').pop() || '';
          const nameB = b.path.split('/').pop() || '';
          comparison = nameA.localeCompare(nameB);
        } else if (sortField === 'size') {
          comparison = a.size - b.size;
        } else if (sortField === 'modified') {
          comparison = a.modifiedAt - b.modifiedAt;
        } else if (sortField === 'type') {
          const typeA = a.type === 'directory' ? 'directory' : a.path.split('.').pop() || '';
          const typeB = b.type === 'directory' ? 'directory' : b.path.split('.').pop() || '';
          comparison = typeA.localeCompare(typeB);
        }
        
        // Always show directories first
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      setEntries(sortedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedPaths(new Set());
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
      setSelectedPaths(new Set());
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
      setSelectedPaths(new Set());
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter((p) => p);
    parts.pop();
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    navigateTo(parentPath);
  };

  const handleSelect = (path: string, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedPaths((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(path)) {
          newSet.delete(path);
        } else {
          newSet.add(path);
        }
        return newSet;
      });
    } else {
      setSelectedPaths(new Set([path]));
    }
  };

  const handleDoubleClick = (entry: FileMetadata) => {
    if (entry.type === 'directory') {
      navigateTo(entry.path);
    } else {
      // For files, could trigger associated app (future enhancement)
      console.log('Open file:', entry.path);
    }
  };

  const handleContextMenu = (entry: FileMetadata, x: number, y: number) => {
    setContextMenuEntry(entry);
    setContextMenuPos({ x, y });
  };

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    saveViewPreferences({ sortField: field, sortDirection: newDirection });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewPreferences({ viewMode: mode });
  };

  const handleItemScaleChange = (scale: number) => {
    setItemScale(scale);
    saveViewPreferences({ itemScale: scale });
  };

  const handleItemPositionChange = (path: string, x: number, y: number) => {
    setItemPositions((prev) => {
      const newMap = new Map(prev);
      newMap.set(path, { x, y });
      
      // Debounce saving positions
      if (positionSaveTimeoutRef.current) {
        clearTimeout(positionSaveTimeoutRef.current);
      }
      positionSaveTimeoutRef.current = setTimeout(() => {
        const positions: Record<string, { x: number; y: number }> = {};
        newMap.forEach((pos, p) => {
          positions[p] = pos;
        });
        saveViewPreferences({ itemPositions: positions });
      }, 500);
      
      return newMap;
    });
  };

  const saveViewPreferences = async (updates: Partial<{
    viewMode: ViewMode;
    itemScale: number;
    sortField: SortField;
    sortDirection: SortDirection;
    itemPositions: Record<string, { x: number; y: number }>;
  }>) => {
    if (!fs) return;
    try {
      const currentMetadata = await loadViewMetadata(fs, currentPath) || {};
      const newMetadata = {
        ...currentMetadata,
        ...updates,
      };
      await saveViewMetadata(fs, currentPath, newMetadata);
    } catch (error) {
      console.error('[FileBrowser] Failed to save view preferences:', error);
    }
  };

  const handleRename = async (newName: string) => {
    if (!fs || !dialogEntry) return;
    
    try {
      const oldPath = dialogEntry.path;
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/')) || '/';
      const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;
      
      if (dialogEntry.type === 'directory') {
        // For directories, create new directory and move contents (simplified - just create with new name)
        // Note: Full rename would require recursive copy, which is complex
        // For now, we'll create the new directory
        await fs.mkdir(newPath);
        // Then delete the old one (this will fail if not empty, which is expected)
        try {
          await fs.rmdir(oldPath);
        } catch {
          // Directory not empty - user needs to move contents manually
          alert('Cannot rename non-empty directory. Please move contents manually.');
          await fs.rmdir(newPath); // Clean up the new empty directory
          return;
        }
      } else {
        // For files, read and write to new path
        const data = await fs.read(oldPath);
        await fs.write(newPath, data);
        await fs.delete(oldPath);
      }
      
      setShowRenameDialog(false);
      setDialogEntry(null);
      await loadDirectory();
    } catch (err) {
      alert('Failed to rename: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDelete = async () => {
    if (!fs || !dialogEntry) return;
    
    try {
      if (dialogEntry.type === 'directory') {
        await fs.rmdir(dialogEntry.path, { recursive: true });
      } else {
        await fs.delete(dialogEntry.path);
      }
      
      setShowDeleteDialog(false);
      setDialogEntry(null);
      setSelectedPaths(new Set());
      await loadDirectory();
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleNewFolder = async (name: string) => {
    if (!fs) return;
    
    try {
      const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      await fs.mkdir(newPath);
      setShowNewFolderDialog(false);
      await loadDirectory();
    } catch (err) {
      alert('Failed to create folder: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCopyPath = () => {
    if (contextMenuEntry) {
      navigator.clipboard.writeText(contextMenuEntry.path);
      setContextMenuEntry(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        loadDirectory();
      } else if (e.key === 'Delete' && selectedPaths.size > 0) {
        e.preventDefault();
        // Delete selected files
        const firstSelected = Array.from(selectedPaths)[0];
        const entry = entries.find((e) => e.path === firstSelected);
        if (entry) {
          setDialogEntry(entry);
          setShowDeleteDialog(true);
        }
      } else if (e.key === 'F2' && selectedPaths.size === 1) {
        e.preventDefault();
        const firstSelected = Array.from(selectedPaths)[0];
        const entry = entries.find((e) => e.path === firstSelected);
        if (entry) {
          setDialogEntry(entry);
          setShowRenameDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPaths, entries]);

  if (!isInitialized || !fs) {
    return (
      <div className="file-browser-loading">
        <div>Loading...</div>
      </div>
    );
  }

  // Sidebar shortcuts — clicking jumps the address to that path.
  const shortcuts: { label: string; icon: string; path: string }[] = [
    { label: 'Home',      icon: '🏠', path: '/home/user' },
    { label: 'Desktop',   icon: '🖥', path: '/home/user/Desktop' },
    { label: 'Documents', icon: '📄', path: '/home/user/Documents' },
    { label: 'Downloads', icon: '📥', path: '/home/user/Downloads' },
    { label: 'Pictures',  icon: '🖼', path: '/home/user/Pictures' },
    { label: 'Music',     icon: '🎵', path: '/home/user/Music' },
    { label: 'Videos',    icon: '🎬', path: '/home/user/Videos' },
  ];
  const tags: { label: string; color: string }[] = [
    { label: 'Important', color: '#ef4444' },
    { label: 'Work',      color: '#f59e0b' },
    { label: 'Personal',  color: '#3461ff' },
    { label: 'Archive',   color: '#10b981' },
  ];

  return (
    <div className="file-browser">
      <Toolbar
        currentPath={currentPath}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        viewMode={viewMode}
        itemScale={itemScale}
        searchQuery={searchQuery}
        onBack={handleBack}
        onForward={handleForward}
        onUp={handleUp}
        onPathChange={navigateTo}
        onRefresh={loadDirectory}
        onViewModeChange={handleViewModeChange}
        onItemScaleChange={handleItemScaleChange}
        onNewFolder={() => setShowNewFolderDialog(true)}
        onSearchChange={setSearchQuery}
      />
      {error && (
        <div className="file-browser-error">
          {error}
        </div>
      )}
      <div className="file-browser-body">
        <aside className="file-browser-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Favorites</div>
            {shortcuts.map((s) => (
              <button
                key={s.path}
                className={`sidebar-item ${currentPath === s.path ? 'active' : ''}`}
                onClick={() => navigateTo(s.path)}
                title={s.path}
              >
                <span className="sidebar-icon">{s.icon}</span>
                <span className="sidebar-label">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-title">Tags</div>
            {tags.map((t) => (
              <button key={t.label} className="sidebar-item sidebar-tag">
                <span className="sidebar-tag-dot" style={{ background: t.color }} />
                <span className="sidebar-label">{t.label}</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="file-browser-main">
          {loading ? (
            <div className="file-browser-loading-content">Loading…</div>
          ) : (
            <FileList
              entries={entries}
              selectedPaths={selectedPaths}
              viewMode={viewMode}
              sortField={sortField}
              sortDirection={sortDirection}
              itemScale={itemScale}
              itemPositions={itemPositions}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleContextMenu}
              onSort={handleSort}
              onItemPositionChange={handleItemPositionChange}
            />
          )}
        </div>
      </div>
      {contextMenuEntry && (
        <ContextMenu
          entry={contextMenuEntry}
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuEntry(null)}
          onOpen={() => {
            handleDoubleClick(contextMenuEntry);
            setContextMenuEntry(null);
          }}
          onRename={() => {
            setDialogEntry(contextMenuEntry);
            setShowRenameDialog(true);
            setContextMenuEntry(null);
          }}
          onDelete={() => {
            setDialogEntry(contextMenuEntry);
            setShowDeleteDialog(true);
            setContextMenuEntry(null);
          }}
          onProperties={() => {
            alert(`Path: ${contextMenuEntry.path}\nType: ${contextMenuEntry.type}\nSize: ${contextMenuEntry.size} bytes\nModified: ${new Date(contextMenuEntry.modifiedAt).toLocaleString()}`);
            setContextMenuEntry(null);
          }}
          onCopyPath={handleCopyPath}
        />
      )}
      {showRenameDialog && dialogEntry && (
        <RenameDialog
          currentName={dialogEntry.path.split('/').pop() || ''}
          onRename={handleRename}
          onCancel={() => {
            setShowRenameDialog(false);
            setDialogEntry(null);
          }}
        />
      )}
      {showDeleteDialog && dialogEntry && (
        <DeleteConfirmDialog
          name={dialogEntry.path.split('/').pop() || ''}
          isDirectory={dialogEntry.type === 'directory'}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDialogEntry(null);
          }}
        />
      )}
      {showNewFolderDialog && (
        <NewFolderDialog
          onCreate={handleNewFolder}
          onCancel={() => setShowNewFolderDialog(false)}
        />
      )}
    </div>
  );
};

