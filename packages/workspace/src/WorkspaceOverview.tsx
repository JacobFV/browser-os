import React from 'react';
import type { Workspace } from '@browser-os/schemas';
import type { Window } from '@browser-os/schemas';
import type { WorkspaceManager } from './WorkspaceManager';
import './WorkspaceOverview.css';

export interface WorkspaceOverviewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  windowsByWorkspace: Map<string, Window[]>;
  onSelectWorkspace: (workspaceId: string) => void;
  onClose: () => void;
}

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  workspaces,
  activeWorkspaceId,
  windowsByWorkspace,
  onSelectWorkspace,
  onClose,
}) => {
  // Arrange workspaces in 2x2 grid
  const gridCols = 2;
  const gridRows = Math.ceil(workspaces.length / gridCols);

  return (
    <div className="workspace-overview" onClick={onClose}>
      <div className="workspace-overview-content" onClick={(e) => e.stopPropagation()}>
        <div className="workspace-overview-header">
          <h2>Workspaces</h2>
          <button className="workspace-overview-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div
          className="workspace-overview-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          }}
        >
          {workspaces.map((workspace) => {
            const windows = windowsByWorkspace.get(workspace.id) ?? [];
            const isActive = workspace.id === activeWorkspaceId;

            return (
              <div
                key={workspace.id}
                className={`workspace-overview-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectWorkspace(workspace.id);
                  onClose();
                }}
              >
                <div className="workspace-overview-item-label">
                  {workspace.name} ({windows.length})
                </div>
                <div className="workspace-overview-item-preview">
                  {windows.length === 0 ? (
                    <div className="workspace-overview-empty">Empty</div>
                  ) : (
                    <div className="workspace-overview-windows">
                      {windows.slice(0, 4).map((window) => (
                        <div key={window.id} className="workspace-overview-window-thumbnail">
                          {window.title}
                        </div>
                      ))}
                      {windows.length > 4 && (
                        <div className="workspace-overview-more">+{windows.length - 4}</div>
                      )}
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

