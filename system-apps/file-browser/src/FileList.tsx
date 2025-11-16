import React, { useState } from 'react';
import type { FileMetadata } from '@browser-os/schemas';
import './FileList.css';

export type SortField = 'name' | 'size' | 'modified' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface FileListProps {
  entries: FileMetadata[];
  selectedPaths: Set<string>;
  viewMode: 'list' | 'details';
  sortField: SortField;
  sortDirection: SortDirection;
  onSelect: (path: string, multiSelect: boolean) => void;
  onDoubleClick: (entry: FileMetadata) => void;
  onContextMenu: (entry: FileMetadata, x: number, y: number) => void;
  onSort: (field: SortField) => void;
}

export const FileList: React.FC<FileListProps> = ({
  entries,
  selectedPaths,
  viewMode,
  sortField,
  sortDirection,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onSort,
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

