import React, { useState } from 'react';
import { Shell } from '@browser-os/shell';
import { applyTheme } from '@browser-os/theme';
import { windowManager } from '@browser-os/windowing';
import { openWindow } from '@browser-os/windowing';

export const WebShell: React.FC = () => {
  const [windows, setWindows] = useState<Array<{ id: string; title: string; appId: string }>>([]);
  const [desktopIcons] = useState([
    { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
    { id: '2', label: 'Terminal', icon: '💻', appId: 'terminal', x: 50, y: 150 },
  ]);

  React.useEffect(() => {
    applyTheme('win95');
  }, []);

  const handleIconClick = (icon: any) => {
    if (icon.appId) {
      const win = openWindow({
        appId: icon.appId,
        title: icon.label,
      });
      setWindows([...windows, { id: win.id, title: win.title, appId: win.appId }]);
    }
  };

  const handleWindowClick = (winId: string) => {
    windowManager.focusWindow(winId);
  };

  return (
    <div className="web-shell">
      <Shell
        mode="desktop"
        windows={windows}
        desktopIcons={desktopIcons}
        onWindowClick={handleWindowClick}
        onIconClick={handleIconClick}
      />
    </div>
  );
};

