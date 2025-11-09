import { useState } from 'react';
import { Window, Taskbar, StartMenu } from '@browser-os/windows';
import '@browser-os/windows/styles';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windows, setWindows] = useState([
    { id: 1, title: 'My Computer', minimized: false },
    { id: 2, title: 'Notepad', minimized: false },
  ]);

  const toggleWindow = (id: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
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
    <div className="app">
      <div className="app__desktop">
        {windows
          .filter((w) => !w.minimized)
          .map((window) => (
            <Window
              key={window.id}
              title={window.title}
              width={500}
              height={400}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => toggleWindow(window.id)}
              onMaximize={() => {}}
            >
              <div className="window-content">
                <h2>{window.title}</h2>
                <p>Welcome to Windows 95!</p>
                <p>This is a demonstration of the browser-os Windows components.</p>
              </div>
            </Window>
          ))}
      </div>

      <Taskbar onStartClick={() => setMenuOpen(!menuOpen)}>
        {windows.map((window) => (
          <button
            key={window.id}
            className="taskbar-button"
            onClick={() => toggleWindow(window.id)}
          >
            {window.title}
          </button>
        ))}
      </Taskbar>

      <StartMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
      />
    </div>
  );
}

export default App;

