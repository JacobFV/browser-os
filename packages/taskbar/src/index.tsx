import React from 'react';

export interface TaskbarProps {
  windows: Array<{ id: string; title: string; appId: string }>;
  onWindowClick: (winId: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  return (
    <div className="taskbar">
      {windows.map((win) => (
        <button
          key={win.id}
          className="taskbar-item"
          onClick={() => onWindowClick(win.id)}
        >
          {win.title}
        </button>
      ))}
    </div>
  );
};

export interface AppSwitcherProps {
  apps: Array<{ id: string; name: string; icon?: string }>;
  onAppSelect: (appId: string) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ apps, onAppSelect }) => {
  return (
    <div className="app-switcher">
      {apps.map((app) => (
        <button
          key={app.id}
          className="app-switcher-item"
          onClick={() => onAppSelect(app.id)}
        >
          {app.icon && <span className="app-icon">{app.icon}</span>}
          <span className="app-name">{app.name}</span>
        </button>
      ))}
    </div>
  );
};

