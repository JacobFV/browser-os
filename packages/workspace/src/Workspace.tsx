import React from 'react';
import type { Window } from '@browser-os/schemas';
import { Window as WindowComponent } from '@browser-os/windowing';
import type { WindowManager } from '@browser-os/windowing';
import './Workspace.css';

export interface WorkspaceProps {
  workspaceId: string;
  windows: Window[];
  windowManager: WindowManager;
  eventBus?: any;
  children?: React.ReactNode;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  workspaceId,
  windows,
  windowManager,
  eventBus,
  children,
}) => {
  return (
    <div className="workspace">
      {children}
      {windows.map((window) => (
        <WindowComponent
          key={window.id}
          window={window}
          onClose={() => windowManager.destroyWindow(window.id)}
          onMinimize={() => windowManager.minimizeWindow(window.id)}
          onMaximize={() => windowManager.maximizeWindow(window.id)}
          onRestore={() => windowManager.restoreWindow(window.id)}
          onFocus={() => windowManager.focusWindow(window.id)}
          onMove={(x, y) => windowManager.updateWindow(window.id, { x, y })}
          onResize={(width, height) => windowManager.updateWindow(window.id, { width, height })}
        >
          {/* Window content will be provided by the app that creates the window */}
          <div style={{ width: '100%', height: '100%', padding: '16px' }}>
            Window: {window.title}
          </div>
        </WindowComponent>
      ))}
    </div>
  );
};

