import React from 'react';
import { AppManager } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { DocumentWindow } from '@system-apps/word-processor/DocumentWindow';

interface AppRendererProps {
  window: Window;
  appManager?: AppManager;
}

export const AppRenderer: React.FC<AppRendererProps> = ({ window, appManager }) => {
  const [AppComponent, setAppComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!appManager) {
      setLoading(false);
      return;
    }
    
    // Get app component (works with both App instances and manifest-based apps)
    appManager.getAppComponent(window.id).then((component: React.ComponentType<any> | null) => {
      setAppComponent(() => component || null);
      setLoading(false);
    });
  }, [window.id, window.appId, appManager]);
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Loading app...</div>;
  }
  
  // If we have a component from app, render it
  if (AppComponent) {
    return <AppComponent />;
  }
  
  // Fallback for legacy apps (word processor)
  if (window.appId === 'os.word-processor' && window.payload?.documentId) {
    return (
      <DocumentWindow
        documentId={window.payload.documentId}
        windowId={window.id}
        initialFileUri={window.payload.fileUri}
        window={window}
      />
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>App: {window.appId}</h2>
      <p>App component not found</p>
    </div>
  );
};

