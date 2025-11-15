import React from 'react';
import './WorkspaceOverviewButton.css';

export interface WorkspaceOverviewButtonProps {
  onClick: () => void;
}

/**
 * 3x3 dot matrix button for workspace overview (like Ubuntu)
 */
export const WorkspaceOverviewButton: React.FC<WorkspaceOverviewButtonProps> = ({ onClick }) => {
  return (
    <button className="workspace-overview-button" onClick={onClick} title="Show all workspaces">
      <div className="workspace-overview-button-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="workspace-overview-button-dot" />
        ))}
      </div>
    </button>
  );
};

