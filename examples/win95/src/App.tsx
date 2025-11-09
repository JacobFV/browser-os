import { useState, useEffect } from 'react';
import { WindowView } from '@browser-os/windowing';
import { Taskbar } from '@browser-os/taskbar';
import type { Window } from '@browser-os/windowing';

// Generate random position within allowable bounds
const getRandomPosition = (windowWidth: number, windowHeight: number) => {
  const maxX = Math.max(0, window.innerWidth - windowWidth - 20);
  const maxY = Math.max(0, window.innerHeight - windowHeight - 100); // Account for taskbar
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);
  return { x, y };
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Initialize windows without positions first
  const [windows, setWindows] = useState<Array<{ id: number; title: string; minimized: boolean; x: number; y: number }>>(() => [
    { id: 1, title: 'My Computer', minimized: false, x: 0, y: 0 },
    { id: 2, title: 'Notepad', minimized: false, x: 0, y: 0 },
  ]);

  // Set random positions after mount when viewport is ready
  useEffect(() => {
    const windowWidth = 500;
    const windowHeight = 400;
    setWindows((prev) =>
      prev.map((w) => {
        const pos = getRandomPosition(windowWidth, windowHeight);
        return { ...w, x: pos.x, y: pos.y };
      })
    );
  }, []);

  const toggleWindow = (id: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWindowPosition = (id: number, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  const menuItems = [
    { label: 'Programs', onClick: () => setMenuOpen(false) },
    { label: 'Documents', onClick: () => setMenuOpen(false) },
    { label: 'Settings', onClick: () => setMenuOpen(false) },
    { label: 'Find', onClick: () => setMenuOpen(false) },
    { label: 'Help', onClick: () => setMenuOpen(false) },
    { label: 'Run...', onClick: () => setMenuOpen(false) },
    { label: 'Shut Down...', onClick: () => setMenuOpen(false) },
  ];

  return (
    <div
      className="app"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#008080',
        position: 'relative',
      }}
    >
      <div
        className="app__desktop"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {windows
          .filter((w) => !w.minimized)
          .map((window) => {
            const windowData: Window = {
              id: window.id.toString(),
              appId: 'example-app',
              title: window.title,
              state: 'floating',
              z: 1,
              bounds: { x: window.x, y: window.y, w: 500, h: 400 },
              workspaceId: 'default',
            };
            return (
              <WindowView
                key={window.id}
                window={windowData}
                onClose={() => closeWindow(window.id)}
                onFocus={() => {}}
                onMinimize={() => toggleWindow(window.id)}
                onMove={(_winId: string, x: number, y: number) => updateWindowPosition(window.id, x, y)}
              >
                <div
                  className="window-content"
                  style={{
                    padding: '16px',
                  }}
                >
                  <h2 style={{ marginBottom: '12px', fontSize: '16px' }}>{window.title}</h2>
                  <p style={{ marginBottom: '8px', lineHeight: 1.5 }}>Welcome to Windows 95!</p>
                  <p style={{ marginBottom: '8px', lineHeight: 1.5 }}>
                    This is a demonstration of the browser-os Windows components.
                  </p>
                </div>
              </WindowView>
            );
          })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', background: '#c0c0c0', borderTop: '2px solid #808080' }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'linear-gradient(to bottom, #c0c0c0, #808080)',
            border: '2px outset #c0c0c0',
            padding: '4px 12px',
            height: '24px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'black',
            fontFamily: "'MS Sans Serif', sans-serif",
          }}
        >
          Start
        </button>
        <Taskbar
          windows={windows.map(w => ({ id: w.id.toString(), title: w.title, appId: 'example-app' }))}
          onWindowClick={(winId: string) => toggleWindow(parseInt(winId))}
        />
      </div>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '0',
            background: '#c0c0c0',
            border: '2px outset #c0c0c0',
            minWidth: '200px',
            zIndex: 10000,
          }}
        >
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setMenuOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: "'MS Sans Serif', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000080';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'black';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

