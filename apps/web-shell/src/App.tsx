import React, { useState, useEffect } from 'react';
import { Shell } from '@browser-os/shell';
import { applyTheme } from '@browser-os/theme';
import { windowManager } from '@browser-os/windowing';
import { openWindow, closeWindow, WindowView } from '@browser-os/windowing';
import { eventBus } from '@browser-os/core';

export const WebShell: React.FC = () => {
  const [windows, setWindows] = useState<Array<{ id: string; title: string; appId: string }>>([]);
  const [desktopIcons] = useState([
    { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
    { id: '2', label: 'Terminal', icon: '💻', appId: 'terminal', x: 50, y: 150 },
  ]);

  React.useEffect(() => {
    applyTheme('win95');
    
    // Listen for window events
    const unsubscribe = eventBus.on('window', (event) => {
      if (event.type === 'open') {
        const win = windowManager.windows.get(event.winId);
        if (win) {
          setWindows(prev => [...prev, { id: win.id, title: win.title, appId: win.appId }]);
        }
      } else if (event.type === 'close') {
        setWindows(prev => prev.filter(w => w.id !== event.winId));
      }
    });
    
    return unsubscribe;
  }, []);

  const handleIconClick = (icon: any) => {
    if (icon.appId) {
      const win = openWindow({
        appId: icon.appId,
        title: icon.label,
      });
    }
  };

  const handleWindowClick = (winId: string) => {
    windowManager.focusWindow(winId);
  };

  const handleWindowClose = (winId: string) => {
    closeWindow(winId);
  };

  const handleWindowMove = (winId: string, x: number, y: number) => {
    windowManager.moveWindow(winId, x, y);
  };

  const handleWindowResize = (winId: string, w: number, h: number) => {
    windowManager.resizeWindow(winId, w, h);
  };

  const allWindows = Array.from(windowManager.windows.values())
    .filter(w => w.state !== 'minimized')
    .sort((a, b) => b.z - a.z);

  return (
    <div className="web-shell" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Shell
        mode="desktop"
        windows={windows}
        desktopIcons={desktopIcons}
        onWindowClick={handleWindowClick}
        onIconClick={handleIconClick}
      />
      {allWindows.map((win) => (
        <WindowView
          key={win.id}
          window={win}
          onClose={handleWindowClose}
          onFocus={handleWindowClick}
          onMove={handleWindowMove}
          onResize={handleWindowResize}
        />
      ))}
    </div>
  );
};

