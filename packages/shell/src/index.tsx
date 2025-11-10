export * from './init';
export * from './state';
export * from './create-os';
export * from './register-apps';
export * from './configure-shell';

import React from 'react';
import { Taskbar } from '@browser-os/taskbar';
import { Desktop } from '@browser-os/desktop';

export type ShellMode = 'desktop' | 'mobile';

export interface DesktopIcon {
  id: string;
  label: string;
  icon?: string;
  appId?: string;
  x: number;
  y: number;
}

export interface ShellProps {
  mode?: ShellMode;
  windows: Array<{ id: string; title: string; appId: string }>;
  desktopIcons: DesktopIcon[];
  onWindowClick: (winId: string) => void;
  onIconClick: (icon: DesktopIcon) => void;
}

export const Shell: React.FC<ShellProps> = ({
  mode = 'desktop',
  windows,
  desktopIcons,
  onWindowClick,
  onIconClick,
}) => {
  if (mode === 'mobile') {
    return (
      <div className="shell shell-mobile">
        <Desktop icons={desktopIcons} onIconClick={onIconClick} onIconDoubleClick={onIconClick} />
      </div>
    );
  }

  return (
    <div className="shell shell-desktop">
      <Desktop icons={desktopIcons} onIconClick={onIconClick} onIconDoubleClick={onIconClick} />
      <Taskbar windows={windows} onWindowClick={onWindowClick} />
    </div>
  );
};

