import React from 'react';
import './WorkspaceOverviewButton.css';

export interface WorkspaceOverviewButtonProps {
  onClick: () => void;
  activeWorkspaceNumber?: number;
}

/**
 * 3x3 dot matrix button for workspace overview (like Ubuntu)
 */
export const WorkspaceOverviewButton: React.FC<WorkspaceOverviewButtonProps> = ({ onClick, activeWorkspaceNumber }) => {
  return (
    <button className="workspace-overview-button" onClick={onClick} title="Show all workspaces">
      <div className="workspace-overview-button-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="workspace-overview-button-dot" />
        ))}
      </div>
      {activeWorkspaceNumber !== undefined && (
        <div className="workspace-overview-button-badge">
          {activeWorkspaceNumber}
        </div>
      )}
    </button>
  );
};

