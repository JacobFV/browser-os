import React from 'react';
import { FilesApp } from '@system-apps/files/App';
import { TerminalApp } from '@system-apps/terminal/App';
import { NotesApp } from '@system-apps/notes/App';
import { CalculatorApp } from '@system-apps/calculator/App';
import { MonitorApp } from '@system-apps/monitor/App';
import { SettingsApp } from '@system-apps/settings/App';
import { DocumentWindow } from '@system-apps/word-processor/DocumentWindow';
import { AppRegistry } from '@browser-os/app-sdk';
import { loadAppFromManifest, getAppManifest } from './app-manifest';

interface AppRendererProps {
  appId: string;
  windowId: string;
  payload?: Record<string, any>;
  appRegistry?: AppRegistry;
}

export const AppRenderer: React.FC<AppRendererProps> = ({ appId, windowId, payload, appRegistry }) => {
  const [AppComponent, setAppComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Use appRegistry if provided, otherwise fall back to legacy app-manifest
    if (appRegistry) {
      const manifest = appRegistry.get(appId);
      if (manifest) {
        appRegistry.loadApp(appId).then((component: React.ComponentType<any> | null) => {
          if (component) {
            setAppComponent(() => component);
          }
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } else {
      // Legacy: Check if app has a manifest
      const manifest = getAppManifest(appId);
      if (manifest) {
        // Load from manifest
        loadAppFromManifest(appId).then(component => {
          setAppComponent(() => component);
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        // Use hardcoded apps
        setLoading(false);
      }
    }
  }, [appId, appRegistry]);
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Loading app...</div>;
  }
  
  // If loaded from manifest, use that component
  if (AppComponent) {
    return <AppComponent windowId={windowId} payload={payload} />;
  }
  
  // Fallback to hardcoded apps
  switch (appId) {
    case 'files':
      return <FilesApp />;
    case 'terminal':
      return <TerminalApp />;
    case 'notes':
      return <NotesApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'monitor':
      return <MonitorApp />;
    case 'settings':
      return <SettingsApp />;
    case 'os.word-processor':
      if (payload?.documentId) {
        return (
          <DocumentWindow
            documentId={payload.documentId}
            windowId={windowId}
            initialFileUri={payload.fileUri}
          />
        );
      }
      return null;
    default:
      return (
        <div style={{ padding: '20px' }}>
          <h2>App: {appId}</h2>
          <p>App component not found</p>
        </div>
      );
  }
};

