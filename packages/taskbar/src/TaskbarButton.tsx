import React from 'react';
import type { TaskbarWindow } from './types';
import type { AppRegistry } from '@browser-os/app-registry';
import './TaskbarButton.css';

export interface TaskbarButtonProps {
  window: TaskbarWindow;
  appRegistry?: AppRegistry;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

/**
 * Generate a consistent color based on a string (app name/id)
 */
function generateColorFromString(str: string): { bg: string; gradient: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue (0-360)
  const hue = Math.abs(hash % 360);
  
  // Use vibrant colors with good saturation and lightness
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%
  
  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const gradient = `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness - 10}%))`;
  
  return { bg, gradient };
}

export const TaskbarButton: React.FC<TaskbarButtonProps> = ({
  window,
  appRegistry,
  onClick,
  onContextMenu,
}) => {
  const app = window.appId && appRegistry ? appRegistry.get(window.appId) : null;
  const icon = app?.manifest.icon;
  const appName = app?.manifest.name || window.title;
  const appId = window.appId || window.title;
  const colorData = generateColorFromString(appId);

  return (
    <button
      className={`taskbar-button ${window.isFocused ? 'focused' : ''} ${window.isMinimized ? 'minimized' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={window.title}
    >
      {icon ? (
        <img src={icon} alt={appName} className="taskbar-button-icon" />
      ) : (
        <span 
          className="taskbar-button-icon-placeholder"
          style={{
            background: colorData.gradient,
          }}
        >
          {appName[0].toUpperCase()}
        </span>
      )}
      <span className="taskbar-button-label">{window.title}</span>
    </button>
  );
};

