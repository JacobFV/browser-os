import React, { useState, useRef, useEffect } from 'react';
import type { FileMetadata } from '@browser-os/schemas';
import './FileList.css';

export type SortField = 'name' | 'size' | 'modified' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface FileListProps {
  entries: FileMetadata[];
  selectedPaths: Set<string>;
  viewMode: 'list' | 'details' | 'tile';
  sortField: SortField;
  sortDirection: SortDirection;
  itemScale?: number;
  itemPositions?: Map<string, { x: number; y: number }>;
  onSelect: (path: string, multiSelect: boolean) => void;
  onDoubleClick: (entry: FileMetadata) => void;
  onContextMenu: (entry: FileMetadata, x: number, y: number) => void;
  onSort: (field: SortField) => void;
  onItemPositionChange?: (path: string, x: number, y: number) => void;
}

export const FileList: React.FC<FileListProps> = ({
  entries,
  selectedPaths,
  viewMode,
  sortField,
  sortDirection,
  itemScale = 1,
  itemPositions,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onSort,
  onItemPositionChange,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileType = (entry: FileMetadata): string => {
    if (entry.type === 'directory') return 'Directory';
    const parts = entry.path.split('/');
    const fileName = parts[parts.length - 1];
    const ext = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : '';
    return ext || 'File';
  };

  const getFileIcon = (entry: FileMetadata): string => {
    return entry.type === 'directory' ? '📁' : '📄';
  };

  const handleContextMenu = (e: React.MouseEvent, entry: FileMetadata) => {
    e.preventDefault();
    onContextMenu(entry, e.clientX, e.clientY);
  };

  const handleClick = (e: React.MouseEvent, entry: FileMetadata) => {
    onSelect(entry.path, e.ctrlKey || e.metaKey);
  };

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`file-list-header ${isActive ? 'active' : ''}`}
        onClick={() => onSort(field)}
      >
        {label}
        {isActive && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </th>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="file-list list-view">
        {entries.map((entry) => {
          const isSelected = selectedPaths.has(entry.path);
          const name = entry.path.split('/').pop() || entry.path;
          return (
            <div
              key={entry.path}
              className={`file-list-item ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleClick(e, entry)}
              onDoubleClick={() => onDoubleClick(entry)}
              onContextMenu={(e) => handleContextMenu(e, entry)}
            >
              <span className="file-list-icon">{getFileIcon(entry)}</span>
              <span className="file-list-name">{name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === 'tile') {
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTileMouseDown = (e: React.MouseEvent, entry: FileMetadata) => {
      if (e.button !== 0) return; // Only left mouse button
      e.preventDefault();
      setDragging(entry.path);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    useEffect(() => {
      if (!dragging || !onItemPositionChange || !containerRef.current) return;

      const handleMouseMove = (e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;
        onItemPositionChange(dragging, Math.max(0, x), Math.max(0, y));
      };

      const handleMouseUp = () => {
        setDragging(null);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [dragging, dragOffset, onItemPositionChange]);

    const baseTileSize = 80;
    const tileSize = baseTileSize * itemScale;

    return (
      <div
        ref={containerRef}
        className="file-list tile-view"
      >
        {entries.map((entry) => {
          const isSelected = selectedPaths.has(entry.path);
          const name = entry.path.split('/').pop() || entry.path;
          const savedPosition = itemPositions?.get(entry.path);
          const position = savedPosition || { x: 0, y: 0 };
          const isDragging = dragging === entry.path;

          return (
            <div
              key={entry.path}
              className={`file-list-tile ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${tileSize}px`,
                transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                zIndex: isDragging ? 1000 : 1,
                cursor: 'move',
              }}
              onMouseDown={(e) => handleTileMouseDown(e, entry)}
              onClick={(e) => {
                if (!isDragging) {
                  handleClick(e, entry);
                }
              }}
              onDoubleClick={() => {
                if (!isDragging) {
                  onDoubleClick(entry);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, entry)}
            >
              <div className="file-list-tile-icon" style={{ fontSize: `${tileSize * 0.4}px` }}>
                {getFileIcon(entry)}
              </div>
              <div className="file-list-tile-name">{name}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="file-list details-view">
      <table className="file-list-table">
        <thead>
          <tr>
            <SortHeader field="name" label="Name" />
            <SortHeader field="size" label="Size" />
            <SortHeader field="modified" label="Modified" />
            <SortHeader field="type" label="Type" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isSelected = selectedPaths.has(entry.path);
            const name = entry.path.split('/').pop() || entry.path;
            return (
              <tr
                key={entry.path}
                className={`file-list-row ${isSelected ? 'selected' : ''}`}
                onClick={(e) => handleClick(e, entry)}
                onDoubleClick={() => onDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
              >
                <td className="file-list-cell name">
                  <span className="file-list-icon">{getFileIcon(entry)}</span>
                  <span className="file-list-name">{name}</span>
                </td>
                <td className="file-list-cell size">{entry.type === 'file' ? formatSize(entry.size) : '-'}</td>
                <td className="file-list-cell modified">{formatDate(entry.modifiedAt)}</td>
                <td className="file-list-cell type">{getFileType(entry)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

