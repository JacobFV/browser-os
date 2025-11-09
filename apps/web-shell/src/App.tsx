import React, { useState, useEffect } from 'react';
import { Shell } from '@browser-os/shell';
import { applyTheme } from '@browser-os/theme';
import { windowManager } from '@browser-os/windowing';
import { openWindow, closeWindow, WindowView } from '@browser-os/windowing';
import { eventBus, createId } from '@browser-os/core';
import { vfs, createMemDriver } from '@browser-os/fs';
import { DocumentWindow } from '@system-apps/word-processor/DocumentWindow.tsx';
import { AppRenderer } from './AppRenderer';

export const WebShell: React.FC = () => {
  const [windows, setWindows] = useState<Array<{ id: string; title: string; appId: string }>>([]);
  const [windowUpdateTrigger, setWindowUpdateTrigger] = useState(0);
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
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

  // Detect mobile mode
  useEffect(() => {
    const checkMode = () => {
      const isMobile = window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024);
      setMode(isMobile ? 'mobile' : 'desktop');
    };
    
    checkMode();
    window.addEventListener('resize', checkMode);
    return () => window.removeEventListener('resize', checkMode);
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
      } else if (event.type === 'minimize') {
        // Remove minimized windows from visible list
        setWindows(prev => prev.filter(w => w.id !== event.winId));
      } else if (event.type === 'restore') {
        // Add restored window back to list
        const win = windowManager.windows.get(event.winId);
        if (win) {
          setWindows(prev => {
            const exists = prev.find(w => w.id === win.id);
            if (!exists) {
              return [...prev, { id: win.id, title: win.title, appId: win.appId }];
            }
            return prev;
          });
          setWindowUpdateTrigger(prev => prev + 1);
        }
      } else if (event.type === 'maximize') {
        // Trigger re-render for maximize
        syncWindows();
        setWindowUpdateTrigger(prev => prev + 1);
      } else if (event.type === 'focus' || event.type === 'update') {
        // Ensure window is in list when focused/updated and trigger re-render
        const win = windowManager.windows.get(event.winId);
        if (win) {
          if (win.state === 'minimized') {
            // Remove minimized windows
            setWindows(prev => prev.filter(w => w.id !== win.id));
          } else {
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
  
  const focusedWindow = allWindows.find(w => w.id === windowManager.focusedWindowId) || allWindows[0];

  // Mobile mode: show full-screen app cards
  if (mode === 'mobile') {
    return (
      <div className="web-shell mobile" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#008080' }}>
        {focusedWindow ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {focusedWindow.appId === 'os.word-processor' && focusedWindow.payload?.documentId ? (
              <DocumentWindow
                documentId={focusedWindow.payload.documentId}
                windowId={focusedWindow.id}
                initialFileUri={focusedWindow.payload.fileUri}
              />
            ) : (
              <AppRenderer
                appId={focusedWindow.appId}
                windowId={focusedWindow.id}
                payload={focusedWindow.payload}
              />
            )}
            {/* Back button */}
            <button
              onClick={() => {
                windowManager.minimizeWindow(focusedWindow.id);
              }}
              style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                zIndex: 10001,
                padding: '8px 16px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ← Home
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', padding: '20px', overflowY: 'auto' }}>
            <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>Apps</h1>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '20px',
              }}
            >
              {desktopIcons.map(icon => (
                <div
                  key={icon.id}
                  onClick={() => handleIconClick(icon)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>{icon.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>{icon.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* App Switcher */}
        {showAppSwitcher && (
          <div 
            className="app-switcher"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '16px',
              zIndex: 10000,
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
            onClick={() => setShowAppSwitcher(false)}
          >
            {windows.map(win => {
              const icon = desktopIcons.find(i => i.appId === win.appId);
              return (
                <div
                  key={win.id}
                  className="app-switcher-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWindowClick(win.id);
                    setShowAppSwitcher(false);
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '32px' }}>{icon?.icon || '📱'}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Swipe up gesture area */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'transparent',
            zIndex: 9999,
          }}
          onTouchStart={(e) => {
            const startY = e.touches[0].clientY;
            const handleTouchMove = (moveEvent: TouchEvent) => {
              const currentY = moveEvent.touches[0].clientY;
              if (startY - currentY > 50) {
                setShowAppSwitcher(true);
                document.removeEventListener('touchmove', handleTouchMove);
              }
            };
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', () => {
              document.removeEventListener('touchmove', handleTouchMove);
            }, { once: true });
          }}
        />
      </div>
    );
  }

  // Desktop mode
  return (
    <div className="web-shell desktop" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
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

