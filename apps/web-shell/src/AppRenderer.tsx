import React from 'react';
import { AppManager } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';

interface AppRendererProps {
  window: Window;
  appManager: AppManager;
}

export const AppRenderer: React.FC<AppRendererProps> = ({ window, appManager }) => {
  const [AppComponent, setAppComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Get app component from App class instance
    appManager.getAppComponent(window.id).then((component: React.ComponentType<any> | null) => {
      setAppComponent(() => component || null);
      setLoading(false);
    });
  }, [window.id, window.appId, appManager]);
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Loading app...</div>;
  }
  
  // Render app component
  if (AppComponent) {
    return <AppComponent />;
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>App: {window.appId}</h2>
      <p>App component not found</p>
    </div>
  );
};

