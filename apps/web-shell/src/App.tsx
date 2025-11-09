import React, { useState, useEffect } from 'react';
import { Shell } from '@browser-os/shell';
import { applyTheme } from '@browser-os/theme';
import { windowManager } from '@browser-os/windowing';
import { openWindow, closeWindow, WindowView } from '@browser-os/windowing';
import { eventBus, createId } from '@browser-os/core';
import { vfs, createMemDriver } from '@browser-os/fs';
import { DocumentWindow } from '../../system-apps/word-processor/src/DocumentWindow';
import { AppRenderer } from './AppRenderer';

export const WebShell: React.FC = () => {
  const [windows, setWindows] = useState<Array<{ id: string; title: string; appId: string }>>([]);
  const [windowUpdateTrigger, setWindowUpdateTrigger] = useState(0);
  const [desktopIcons] = useState([
    { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
    { id: '2', label: 'Terminal', icon: '💻', appId: 'terminal', x: 50, y: 150 },
    { id: '3', label: 'Word Processor', icon: '📝', appId: 'os.word-processor', x: 50, y: 250 },
    { id: '4', label: 'Notepad', icon: '📄', appId: 'notes', x: 50, y: 350 },
    { id: '5', label: 'Calculator', icon: '🔢', appId: 'calculator', x: 50, y: 450 },
    { id: '6', label: 'Monitor', icon: '📊', appId: 'monitor', x: 50, y: 550 },
    { id: '7', label: 'Settings', icon: '⚙️', appId: 'settings', x: 50, y: 650 },
  ]);

  // Initialize VFS with documents mount
  useEffect(() => {
    const memDriver = createMemDriver();
    vfs.mount({
      mountPoint: '/documents',
      driver: memDriver,
    });
  }, []);

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
      } else if (event.type === 'maximize') {
        // Trigger re-render for maximize
        syncWindows();
        setWindowUpdateTrigger(prev => prev + 1);
      } else if (event.type === 'focus' || event.type === 'update') {
        // Ensure window is in list when focused/updated and trigger re-render
        const win = windowManager.windows.get(event.winId);
        if (win && win.state !== 'minimized') {
          setWindows(prev => {
            const exists = prev.find(w => w.id === win.id);
            if (!exists) {
              return [...prev, { id: win.id, title: win.title, appId: win.appId }];
            } else {
              // Update title if changed
              return prev.map(w => w.id === win.id ? { ...w, title: win.title } : w);
            }
          });
          // Trigger re-render to update z-index and title
          setWindowUpdateTrigger(prev => prev + 1);
        }
      }
    });
    
    return unsubscribe;
  }, []);

  const handleIconClick = (icon: any) => {
    if (icon.appId) {
      if (icon.appId === 'os.word-processor') {
        // Create new document for word processor
        const docId = createId();
        openWindow({
          appId: icon.appId,
          title: 'Untitled',
          payload: { documentId: docId },
        });
      } else {
        const win = openWindow({
          appId: icon.appId,
          title: icon.label,
        });
      }
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
      {allWindows.map((win) => {
        // Render DocumentWindow for word processor windows
        if (win.appId === 'os.word-processor' && win.payload?.documentId) {
          return (
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
            >
              <DocumentWindow
                documentId={win.payload.documentId}
                windowId={win.id}
                initialFileUri={win.payload.fileUri}
              />
            </WindowView>
          );
        }
        
        // Render other apps
        return (
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
          >
            <AppRenderer appId={win.appId} windowId={win.id} payload={win.payload} />
          </WindowView>
        );
      })}
    </div>
  );
};

