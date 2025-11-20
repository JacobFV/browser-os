import React from 'react';
import type { Folder } from '../types';
import './FolderSidebar.css';

export interface FolderSidebarProps {
  folders: Folder[];
  activeFolder: string;
  onSelectFolder: (folderId: string) => void;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  activeFolder,
  onSelectFolder,
}) => {
  const getFolderIcon = (type: Folder['type']): string => {
    switch (type) {
      case 'inbox':
        return '📥';
      case 'sent':
        return '📤';
      case 'drafts':
        return '📝';
      case 'trash':
        return '🗑️';
      case 'spam':
        return '🚫';
      default:
        return '📁';
    }
  };

  // Sort folders: standard folders first, then custom
  const sortedFolders = [...folders].sort((a, b) => {
    const order: Record<string, number> = {
      inbox: 1,
      sent: 2,
      drafts: 3,
      trash: 4,
      spam: 5,
      custom: 99,
    };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });

  return (
    <div className="folder-sidebar">
      <div className="folder-list">
        {sortedFolders.map((folder) => (
          <div
            key={folder.id}
            className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="folder-icon">{getFolderIcon(folder.type)}</span>
            <span className="folder-name">{folder.name}</span>
            {folder.unreadCount > 0 && (
              <span className="folder-unread-count">{folder.unreadCount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

