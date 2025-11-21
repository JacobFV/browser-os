import React, { useState, useRef, useEffect } from 'react';
import type { Workspace } from '@browser-os/schemas';
import type { Window } from '@browser-os/schemas';
import type { WorkspaceManager } from './types';
import type { WindowManager } from '@browser-os/windowing';
import type { AppRegistry } from '@browser-os/app-registry';
import { EventBus } from '@browser-os/events';
import './WorkspaceOverview.css';

export interface WorkspaceOverviewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  windowsByWorkspace: Map<string, Window[]>;
  workspaceManager: WorkspaceManager;
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  eventBus?: EventBus;
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

interface ContextMenuState {
  workspaceId: string;
  x: number;
  y: number;
}

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  workspaces,
  activeWorkspaceId: initialActiveWorkspaceId,
  windowsByWorkspace,
  workspaceManager,
  windowManager,
  appRegistry,
  eventBus,
  onSelectWorkspace,
  onClose,
}) => {
  const [draggedWindowId, setDraggedWindowId] = useState<string | null>(null);
  const [dragOverWorkspaceId, setDragOverWorkspaceId] = useState<string | null>(null);
  const [draggedWorkspaceId, setDraggedWorkspaceId] = useState<string | null>(null);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>(workspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(initialActiveWorkspaceId);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [colorPickerWorkspaceId, setColorPickerWorkspaceId] = useState<string | null>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Update workspace list when workspaces prop changes
  useEffect(() => {
    setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
  }, [workspaces, workspaceManager]);

  // Listen to workspace switch events to update active workspace
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribe = eventBus.on('workspace:switched', (event) => {
      if (event.payload && typeof event.payload === 'object' && 'workspaceId' in event.payload) {
        setActiveWorkspaceId(event.payload.workspaceId as string);
      }
    });

    return unsubscribe;
  }, [eventBus]);

  // Update activeWorkspaceId when prop changes
  useEffect(() => {
    setActiveWorkspaceId(initialActiveWorkspaceId);
  }, [initialActiveWorkspaceId]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingWorkspaceId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingWorkspaceId]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerWorkspaceId(null);
      }
    };

    if (contextMenu || colorPickerWorkspaceId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu, colorPickerWorkspaceId]);

  const handleCreateWorkspace = () => {
    if (workspaceList.length >= 10) {
      return;
    }
    workspaceManager.createWorkspace();
    setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    try {
      workspaceManager.deleteWorkspace(workspaceId);
      setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  const handleRenameWorkspace = (workspaceId: string, newName: string) => {
    try {
      workspaceManager.renameWorkspace(workspaceId, newName);
      setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
      setEditingWorkspaceId(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to rename workspace:', error);
    }
  };

  const handleDuplicateWorkspace = (workspaceId: string) => {
    try {
      workspaceManager.duplicateWorkspace(workspaceId);
      setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to duplicate workspace:', error);
    }
  };

  const handleColorChange = (workspaceId: string, color: string) => {
    try {
      workspaceManager.updateWorkspaceColor(workspaceId, color);
      setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
      setColorPickerWorkspaceId(null);
    } catch (error) {
      console.error('Failed to update workspace color:', error);
    }
  };

  // Predefined color palette
  const colorPalette = [
    '#007aff', '#5ac8fa', '#34c759', '#ff9500', '#ff3b30',
    '#af52de', '#ff2d55', '#ffcc00', '#00c7be', '#8e8e93',
    '#5856d6', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3',
    '#f38181', '#aa96da', '#fcbad3', '#a8e6cf', '#ffd3a5',
  ];

  const startEditing = (workspaceId: string, currentName: string) => {
    setEditingWorkspaceId(workspaceId);
    setEditingName(currentName);
    setContextMenu(null);
  };

  const finishEditing = (workspaceId: string) => {
    if (editingName.trim()) {
      handleRenameWorkspace(workspaceId, editingName.trim());
    } else {
      setEditingWorkspaceId(null);
    }
  };

  const handleContextMenu = (workspaceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      workspaceId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleWindowDragStart = (windowId: string, e: React.DragEvent) => {
    setDraggedWindowId(windowId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', windowId);
    const sourceElement = e.currentTarget as HTMLElement;
    const dragImage = sourceElement.cloneNode(true) as HTMLElement;
    
    dragImage.style.position = 'fixed';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.width = sourceElement.offsetWidth + 'px';
    dragImage.style.height = sourceElement.offsetHeight + 'px';
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.transform = 'none';
    dragImage.style.margin = '0';
    
    document.body.appendChild(dragImage);
    const rect = sourceElement.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleWindowDragEnd = () => {
    setDraggedWindowId(null);
    setDragOverWorkspaceId(null);
  };

  const handleWorkspaceDragStart = (workspaceId: string, e: React.DragEvent) => {
    setDraggedWorkspaceId(workspaceId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', workspaceId);
  };

  const handleWorkspaceDragEnd = () => {
    setDraggedWorkspaceId(null);
    setDragOverWorkspaceId(null);
  };

  const handleWorkspaceDragOver = (workspaceId: string, e: React.DragEvent) => {
    if (draggedWindowId || (draggedWorkspaceId && draggedWorkspaceId !== workspaceId)) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      setDragOverWorkspaceId(workspaceId);
    }
  };

  const handleWorkspaceDragLeave = () => {
    // Only clear if we're not dragging a workspace
    if (!draggedWorkspaceId) {
      setDragOverWorkspaceId(null);
    }
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
    } else if (draggedWorkspaceId && draggedWorkspaceId !== targetWorkspaceId) {
      const targetWorkspace = workspaceManager.getWorkspace(targetWorkspaceId);
      if (targetWorkspace) {
        workspaceManager.reorderWorkspace(draggedWorkspaceId, targetWorkspace.index);
        setWorkspaceList(workspaceManager.getAllWorkspaces().sort((a, b) => a.index - b.index));
      }
    }
    
    handleWindowDragEnd();
    handleWorkspaceDragEnd();
  };

  const canDeleteWorkspace = (workspaceId: string): boolean => {
    const windows = windowsByWorkspace.get(workspaceId) ?? [];
    const allWorkspaces = workspaceManager.getAllWorkspaces();
    return windows.length === 0 && allWorkspaces.length > 1;
  };

  // Calculate grid layout
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
            const isDragging = draggedWorkspaceId === workspace.id;
            const workspaceNumber = workspace.index + 1;
            const shortcutKey = workspaceNumber <= 9 ? `Ctrl+${workspaceNumber}` : null;

            return (
              <div
                key={workspace.id}
                className={`workspace-overview-item ${isActive ? 'active' : ''} ${isDragOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{
                  borderColor: workspace.color,
                  '--workspace-color': workspace.color,
                } as React.CSSProperties & { '--workspace-color': string }}
                draggable={!editingWorkspaceId}
                onDragStart={(e) => handleWorkspaceDragStart(workspace.id, e)}
                onDragEnd={handleWorkspaceDragEnd}
                onDragOver={(e) => handleWorkspaceDragOver(workspace.id, e)}
                onDragLeave={handleWorkspaceDragLeave}
                onDrop={(e) => handleWorkspaceDrop(workspace.id, e)}
                onContextMenu={(e) => handleContextMenu(workspace.id, e)}
                onClick={(e) => {
                  if (!contextMenu && !editingWorkspaceId) {
                    onSelectWorkspace(workspace.id);
                    onClose();
                  }
                }}
              >
                {/* Keyboard shortcut badge */}
                {shortcutKey && (
                  <div className="workspace-overview-shortcut-badge" title={`Switch with ${shortcutKey}`}>
                    {shortcutKey}
                  </div>
                )}

                <div className="workspace-overview-item-header">
                  <div className="workspace-overview-item-label-container">
                    <span className="workspace-overview-item-number">{workspaceNumber}.</span>
                    {editingWorkspaceId === workspace.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        className="workspace-overview-item-name-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => finishEditing(workspace.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            finishEditing(workspace.id);
                          } else if (e.key === 'Escape') {
                            setEditingWorkspaceId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="workspace-overview-item-name">{workspace.name}</span>
                        {windows.length > 0 && (
                          <span className="workspace-overview-item-count"> ({windows.length})</span>
                        )}
                        <button
                          className="workspace-overview-item-rename"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(workspace.id, workspace.name || '');
                          }}
                          title="Rename workspace"
                        >
                          ✎
                        </button>
                      </>
                    )}
                  </div>
                  <div className="workspace-overview-item-header-actions">
                    <button
                      ref={(el) => {
                        if (el) colorButtonRefs.current.set(workspace.id, el);
                        else colorButtonRefs.current.delete(workspace.id);
                      }}
                      className="workspace-overview-item-color-picker"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colorPickerWorkspaceId === workspace.id) {
                          setColorPickerWorkspaceId(null);
                          setColorPickerPosition(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setColorPickerWorkspaceId(workspace.id);
                          setColorPickerPosition({
                            x: rect.left - 180,
                            y: rect.top + rect.height / 2 - 100,
                          });
                        }
                        setContextMenu(null);
                      }}
                      title="Change workspace color"
                      style={{ backgroundColor: workspace.color }}
                    />
                    {canDeleteWorkspace(workspace.id) && !editingWorkspaceId && (
                      <button
                        className="workspace-overview-item-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id);
                        }}
                        title="Delete workspace"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className="workspace-overview-item-preview">
                  {windows.length === 0 ? (
                    <div className="workspace-overview-empty">
                      <div className="workspace-overview-empty-title">No windows open</div>
                      <div className="workspace-overview-empty-subtitle">Open an app or drag windows here</div>
                    </div>
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="workspace-overview-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="workspace-overview-context-menu-item"
            onClick={() => {
              const workspace = workspaceManager.getWorkspace(contextMenu.workspaceId);
              if (workspace) {
                startEditing(contextMenu.workspaceId, workspace.name || '');
              }
            }}
          >
            Rename
          </button>
          <button
            className="workspace-overview-context-menu-item"
            onClick={() => handleDuplicateWorkspace(contextMenu.workspaceId)}
          >
            Duplicate
          </button>
          {canDeleteWorkspace(contextMenu.workspaceId) && (
            <button
              className="workspace-overview-context-menu-item workspace-overview-context-menu-item-danger"
              onClick={() => handleDeleteWorkspace(contextMenu.workspaceId)}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Color Picker */}
      {colorPickerWorkspaceId && colorPickerPosition && (
        <div
          ref={colorPickerRef}
          className="workspace-overview-color-picker"
          style={{
            position: 'fixed',
            left: colorPickerPosition.x,
            top: colorPickerPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="workspace-overview-color-picker-grid">
            {colorPalette.map((color) => (
              <button
                key={color}
                className="workspace-overview-color-picker-color"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(colorPickerWorkspaceId, color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
