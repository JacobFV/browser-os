import React, { useState, useEffect, useCallback } from 'react';
import { windowManager } from '@browser-os/windowing';
import { openWindow, closeWindow, WindowView } from '@browser-os/windowing';
import { eventBus } from '@browser-os/core';
import './App.css';

export const BasicWindowingExample: React.FC = () => {
  const [windowUpdateTrigger, setWindowUpdateTrigger] = useState(0);

  useEffect(() => {
    // Listen for window events to trigger re-renders
    const unsubscribe = eventBus.on('window', (event) => {
      if (event.type === 'focus' || event.type === 'move' || event.type === 'resize' || 
          event.type === 'minimize' || event.type === 'maximize' || event.type === 'restore') {
        setWindowUpdateTrigger(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const handleOpenWindow = (title: string, content: string) => {
    openWindow({
      appId: `app-${Date.now()}`,
      title,
      bounds: { 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200, 
        w: 500, 
        h: 400 
      },
      payload: { content },
    });
    setWindowUpdateTrigger(prev => prev + 1);
  };

  const handleCloseWindow = (winId: string) => {
    closeWindow(winId);
  };

  const handleWindowMove = useCallback((winId: string, x: number, y: number) => {
    windowManager.moveWindow(winId, x, y);
  }, []);

  const handleWindowResize = useCallback((winId: string, w: number, h: number) => {
    windowManager.resizeWindow(winId, w, h);
  }, []);

  const handleWindowFocus = useCallback((winId: string) => {
    windowManager.focusWindow(winId);
  }, []);

  const handleWindowMinimize = (winId: string) => {
    windowManager.minimizeWindow(winId);
  };

  const handleWindowMaximize = (winId: string) => {
    windowManager.maximizeWindow(winId);
  };

  const handleWindowRestore = (winId: string) => {
    windowManager.restoreWindow(winId);
  };

  // Get all non-minimized windows, sorted by z-index
  const allWindows = Array.from(windowManager.windows.values())
    .filter(w => w.state !== 'minimized')
    .sort((a, b) => b.z - a.z);

  return (
    <div className="basic-windowing-example">
      <div className="controls">
        <h1>Basic Windowing Example</h1>
        <p>Demonstrates core windowing functionality</p>
        <div className="button-group">
          <button onClick={() => handleOpenWindow('Window 1', 'This is the first window. You can drag it around!')}>
            Open Window 1
          </button>
          <button onClick={() => handleOpenWindow('Window 2', 'This is the second window. Try resizing it!')}>
            Open Window 2
          </button>
          <button onClick={() => handleOpenWindow('Window 3', 'This is the third window. Try minimizing and maximizing!')}>
            Open Window 3
          </button>
        </div>
        <div className="info">
          <p><strong>Active Windows:</strong> {Array.from(windowManager.windows.values()).filter(w => w.state !== 'minimized').length}</p>
          <p><strong>Focused Window:</strong> {windowManager.focusedWindowId || 'None'}</p>
        </div>
      </div>

      <div className="window-container">
        {allWindows.map((win) => (
          <WindowView
            key={win.id}
            window={win}
            onClose={handleCloseWindow}
            onFocus={handleWindowFocus}
            onMove={handleWindowMove}
            onResize={handleWindowResize}
            onMinimize={handleWindowMinimize}
            onMaximize={handleWindowMaximize}
            onRestore={handleWindowRestore}
          >
            <div className="window-content">
              <h2>{win.title}</h2>
              <p>{win.payload?.content || 'Window content'}</p>
              <div className="window-info">
                <p><strong>ID:</strong> {win.id}</p>
                <p><strong>State:</strong> {win.state}</p>
                <p><strong>Position:</strong> ({win.bounds.x}, {win.bounds.y})</p>
                <p><strong>Size:</strong> {win.bounds.w} × {win.bounds.h}</p>
                <p><strong>Z-Index:</strong> {win.z}</p>
              </div>
            </div>
          </WindowView>
        ))}
      </div>
    </div>
  );
};

