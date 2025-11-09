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
    
    // Sync windows list with window manager on mount
    const syncWindows = () => {
      const allWindows = Array.from(windowManager.windows.values());
      setWindows(allWindows.map(win => ({ id: win.id, title: win.title, appId: win.appId })));
    };
    
    syncWindows();
    
    // Listen for window events
    const unsubscribe = eventBus.on('window', (event) => {
      if (event.type === 'open') {
        const win = windowManager.windows.get(event.winId);
        if (win) {
          setWindows(prev => {
            if (prev.find(w => w.id === win.id)) return prev;
            return [...prev, { id: win.id, title: win.title, appId: win.appId }];
          });
        }
      } else if (event.type === 'close') {
        setWindows(prev => prev.filter(w => w.id !== event.winId));
      } else if (event.type === 'minimize' || event.type === 'restore') {
        // Sync windows list to reflect state changes
        syncWindows();
      } else if (event.type === 'focus') {
        // Ensure window is in list when focused
        const win = windowManager.windows.get(event.winId);
        if (win && win.state !== 'minimized') {
          setWindows(prev => {
            if (prev.find(w => w.id === win.id)) return prev;
            return [...prev, { id: win.id, title: win.title, appId: win.appId }];
          });
        }
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
    const win = windowManager.windows.get(winId);
    if (win?.state === 'minimized') {
      windowManager.restoreWindow(winId);
      windowManager.focusWindow(winId);
    } else {
      windowManager.focusWindow(winId);
    }
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

  const handleWindowMinimize = (winId: string) => {
    windowManager.minimizeWindow(winId);
    // Keep window in taskbar list but mark as minimized
  };

  const handleWindowMaximize = (winId: string) => {
    windowManager.maximizeWindow(winId);
  };

  const handleWindowRestore = (winId: string) => {
    windowManager.restoreWindow(winId);
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
          onMinimize={handleWindowMinimize}
          onMaximize={handleWindowMaximize}
          onRestore={handleWindowRestore}
        />
      ))}
    </div>
  );
};

