import React from 'react';
import type { Window } from '@browser-os/schemas';
import { Window as WindowComponent } from '@browser-os/windowing';
import type { WindowManager } from '@browser-os/windowing';
import type { AppComponentRegistry, AppComponentProps } from './types';
import './Workspace.css';

export interface WorkspaceProps {
  workspaceId: string;
  windows: Window[];
  windowManager: WindowManager;
  appComponentRegistry?: AppComponentRegistry;
  eventBus?: any;
  os?: any; // Can be a function that creates os API per appId, or the os API object itself
  children?: React.ReactNode;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  workspaceId,
  windows,
  windowManager,
  appComponentRegistry,
  eventBus,
  os,
  children,
}) => {
  const renderWindowContent = (window: Window) => {
    // If window has an appId, try to render the app component
    if (window.appId && appComponentRegistry) {
      const AppComponent = appComponentRegistry.getAppComponent(window.appId);
      if (AppComponent) {
        // Create os API for this specific app/window
        const osAPI = typeof os === 'function' ? os(window.appId) : os;
        const props: AppComponentProps = {
          windowId: window.id,
          appId: window.appId,
          eventBus: eventBus,
          os: osAPI,
        };
        return <AppComponent {...props} />;
      }
    }

    // Fallback to placeholder content
    return (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        Window: {window.title}
      </div>
    );
  };

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
          onMove={(x: number, y: number) => windowManager.updateWindow(window.id, { x, y })}
          onResize={(width: number, height: number) => windowManager.updateWindow(window.id, { width, height })}
        >
          {renderWindowContent(window)}
        </WindowComponent>
      ))}
    </div>
  );
};

