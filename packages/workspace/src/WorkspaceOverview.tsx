import React, { useState, useRef, useEffect } from 'react';
import type { Workspace } from '@browser-os/schemas';
import type { Window } from '@browser-os/schemas';
import type { WorkspaceManager } from './types';
import type { WindowManager } from '@browser-os/windowing';
import type { AppRegistry } from '@browser-os/app-registry';
import './WorkspaceOverview.css';

export interface WorkspaceOverviewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  windowsByWorkspace: Map<string, Window[]>;
  workspaceManager: WorkspaceManager;
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  onSelectWorkspace: (workspaceId: string) => void;
  onClose: () => void;
}

/**
 * Generate a consistent color based on a string (app name/id)
 */
function generateColorFromString(str: string): { bg: string; gradient: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20);
  const lightness = 45 + (Math.abs(hash >> 8) % 15);
  
  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const gradient = `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness - 10}%))`;
  
  return { bg, gradient };
}

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  workspaces,
  activeWorkspaceId,
  windowsByWorkspace,
  workspaceManager,
  windowManager,
  appRegistry,
  onSelectWorkspace,
  onClose,
}) => {
  const [draggedWindowId, setDraggedWindowId] = useState<string | null>(null);
  const [dragOverWorkspaceId, setDragOverWorkspaceId] = useState<string | null>(null);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>(workspaces);

  // Update workspace list when workspaces prop changes
  useEffect(() => {
    setWorkspaceList(workspaceManager.getAllWorkspaces());
  }, [workspaces, workspaceManager]);

  const handleCreateWorkspace = () => {
    // Prevent creating too many workspaces (cap at 10)
    if (workspaceList.length >= 10) {
      return;
    }
    workspaceManager.createWorkspace();
    setWorkspaceList(workspaceManager.getAllWorkspaces());
  };

  const handleDeleteWorkspace = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      workspaceManager.deleteWorkspace(workspaceId);
      setWorkspaceList(workspaceManager.getAllWorkspaces());
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      // Could show a toast/notification here
    }
  };

  const handleWindowDragStart = (windowId: string, e: React.DragEvent) => {
    setDraggedWindowId(windowId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', windowId);
    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleWindowDragEnd = () => {
    setDraggedWindowId(null);
    setDragOverWorkspaceId(null);
  };

  const handleWorkspaceDragOver = (workspaceId: string, e: React.DragEvent) => {
    if (draggedWindowId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverWorkspaceId(workspaceId);
    }
  };

  const handleWorkspaceDragLeave = () => {
    setDragOverWorkspaceId(null);
  };

  const handleWorkspaceDrop = (targetWorkspaceId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedWindowId) {
      const sourceWindows = Array.from(windowsByWorkspace.values()).flat();
      const window = sourceWindows.find(w => w.id === draggedWindowId);
      
      if (window && window.workspaceId !== targetWorkspaceId) {
        workspaceManager.moveWindowToWorkspace(draggedWindowId, targetWorkspaceId);
      }
    }
    
    handleWindowDragEnd();
  };

  const canDeleteWorkspace = (workspaceId: string): boolean => {
    const windows = windowsByWorkspace.get(workspaceId) ?? [];
    const allWorkspaces = workspaceManager.getAllWorkspaces();
    return windows.length === 0 && allWorkspaces.length > 1 && workspaceId !== activeWorkspaceId;
  };

  // Calculate grid layout - flexible columns based on workspace count
  const workspaceCount = workspaceList.length;
  let gridCols = 2;
  if (workspaceCount === 1) gridCols = 1;
  else if (workspaceCount <= 4) gridCols = 2;
  else if (workspaceCount <= 6) gridCols = 3;
  else gridCols = 3;

  return (
    <div className="workspace-overview" onClick={onClose}>
      <div className="workspace-overview-content" onClick={(e) => e.stopPropagation()}>
        <div className="workspace-overview-header">
          <h2>Workspaces</h2>
          <div className="workspace-overview-header-actions">
            <button
              className="workspace-overview-add"
              onClick={handleCreateWorkspace}
              disabled={workspaceList.length >= 10}
              title="Add workspace"
            >
              +
            </button>
            <button className="workspace-overview-close" onClick={onClose} title="Close">
              ×
            </button>
          </div>
        </div>
        <div
          className="workspace-overview-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {workspaceList.map((workspace) => {
            const windows = windowsByWorkspace.get(workspace.id) ?? [];
            const isActive = workspace.id === activeWorkspaceId;
            const isDragOver = dragOverWorkspaceId === workspace.id;

            return (
              <div
                key={workspace.id}
                className={`workspace-overview-item ${isActive ? 'active' : ''} ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => {
                  onSelectWorkspace(workspace.id);
                  onClose();
                }}
                onDragOver={(e) => handleWorkspaceDragOver(workspace.id, e)}
                onDragLeave={handleWorkspaceDragLeave}
                onDrop={(e) => handleWorkspaceDrop(workspace.id, e)}
              >
                <div className="workspace-overview-item-header">
                  <div className="workspace-overview-item-label">
                    {workspace.name}
                    {windows.length > 0 && (
                      <span className="workspace-overview-item-count"> ({windows.length})</span>
                    )}
                  </div>
                  {canDeleteWorkspace(workspace.id) && (
                    <button
                      className="workspace-overview-item-delete"
                      onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                      title="Delete workspace"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="workspace-overview-item-preview">
                  {windows.length === 0 ? (
                    <div className="workspace-overview-empty">Empty</div>
                  ) : (
                    <div className="workspace-overview-windows">
                      {windows.map((window) => {
                        const app = window.appId ? appRegistry.get(window.appId) : null;
                        const icon = app?.manifest.icon;
                        const appName = app?.manifest.name || window.title;
                        const appId = window.appId || window.title;
                        const colorData = generateColorFromString(appId);
                        const isDragging = draggedWindowId === window.id;

                        return (
                          <div
                            key={window.id}
                            className={`workspace-overview-window-thumbnail ${isDragging ? 'dragging' : ''} ${window.state === 'minimized' ? 'minimized' : ''}`}
                            draggable
                            onDragStart={(e) => handleWindowDragStart(window.id, e)}
                            onDragEnd={handleWindowDragEnd}
                            onClick={(e) => {
                              e.stopPropagation();
                              windowManager.focusWindow(window.id);
                              onClose();
                            }}
                            title={window.title}
                          >
                            {icon ? (
                              <img src={icon} alt={appName} className="workspace-overview-window-icon" />
                            ) : (
                              <div
                                className="workspace-overview-window-icon-placeholder"
                                style={{ background: colorData.gradient }}
                              >
                                {appName[0].toUpperCase()}
                              </div>
                            )}
                            <div className="workspace-overview-window-title">{window.title}</div>
                            {window.state === 'minimized' && (
                              <div className="workspace-overview-window-minimized-indicator">−</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
