import React from 'react';
import { FilesApp } from '../../system-apps/files/src/App';
import { TerminalApp } from '../../system-apps/terminal/src/App';
import { NotesApp } from '../../system-apps/notes/src/App';
import { CalculatorApp } from '../../system-apps/calculator/src/App';
import { MonitorApp } from '../../system-apps/monitor/src/App';
import { SettingsApp } from '../../system-apps/settings/src/App';
import { DocumentWindow } from '../../system-apps/word-processor/src/DocumentWindow';

interface AppRendererProps {
  appId: string;
  windowId: string;
  payload?: Record<string, any>;
}

export const AppRenderer: React.FC<AppRendererProps> = ({ appId, windowId, payload }) => {
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

