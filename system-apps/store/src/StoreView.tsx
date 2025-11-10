import React, { useState, useEffect } from 'react';
import { AppManager } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import './Store.css';

interface StoreViewProps {
  window: Window;
  appManager: AppManager;
}

export const StoreView: React.FC<StoreViewProps> = ({ window, appManager }) => {
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const apps = appManager.getAllApps();
      setInstalledApps(apps.map(app => ({
        id: app.id,
        name: app.name,
        version: app.version,
      })));
      
      // In a real implementation, this would fetch from a remote store
      setAvailableApps([
        {
          id: 'example-app',
          name: 'Example App',
          version: '1.0.0',
          description: 'An example application',
          icon: '📦',
        },
      ]);
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (app: any) => {
    try {
      // In a real implementation, this would download and install the app
      // For now, just show a message
      alert(`App installation not yet implemented. ${app.name} would be installed here.`);
    } catch (error: any) {
      alert(`Failed to install: ${error.message}`);
    }
  };

  const handleLaunch = async (app: any) => {
    try {
      await appManager.launchApp(app.id, {
        title: app.name,
        bounds: { x: 100, y: 100, w: 800, h: 600 },
      });
    } catch (error: any) {
      alert(`Failed to launch app: ${error.message}`);
    }
  };

  const handleUpdate = async (app: any) => {
    try {
      // In a real implementation, this would check for updates and install them
      alert(`Checking for updates for ${app.name}...`);
    } catch (error: any) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading app store...</div>;
  }

  return (
    <div className="store-app" style={{ padding: '20px', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h1>App Store</h1>
      
      <div className="store-section">
        <h2>Installed Apps</h2>
        <div className="app-grid">
          {installedApps.map(app => (
            <div key={app.id} className="app-card">
              <div className="app-icon">{app.icon || '📱'}</div>
              <div className="app-info">
                <h3>{app.name}</h3>
                <p>{app.version}</p>
                <div className="app-actions">
                  <button onClick={() => handleLaunch(app)}>Launch</button>
                  <button onClick={() => handleUpdate(app)}>Update</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="store-section">
        <h2>Available Apps</h2>
        <div className="app-grid">
          {availableApps.map(app => (
            <div key={app.id} className="app-card">
              <div className="app-icon">{app.icon || '📦'}</div>
              <div className="app-info">
                <h3>{app.name}</h3>
                <p>{app.description || app.version}</p>
                <div className="app-actions">
                  <button onClick={() => handleInstall(app)}>Install</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

