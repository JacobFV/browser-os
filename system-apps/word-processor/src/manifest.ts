import { AppManifest } from '@browser-os/core';
import { WordProcessorApp } from './src/App';

export const manifest: AppManifest = {
  id: 'os.word-processor',
  name: 'Word Processor',
  version: '1.0.0',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDJINkMyIDIgMiAyIDIgNlYxOEMyIDE5LjEgMi4wMDAwMSAyMCAyLjAwMDAxIDIwSDZWMjJIMTJWMTlIMThWMTBMMTQgMloiIGZpbGw9IiMwMDAwODAiLz4KPHBhdGggZD0iTTE0IDJWMTBIEThWMTlIMTJWMTlIMThWMTBMMTQgMloiIGZpbGw9IiM2NjdlZWEiLz4KPC9zdmc+',
  entry: async () => WordProcessorApp,
  defaultWindow: {
    w: 1000,
    h: 700,
    resizable: true,
  },
  permissions: ['fs.read', 'fs.write'],
  intents: ['open://text/*', 'open://document/*'],
};

