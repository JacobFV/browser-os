import { DesktopIcon } from '@browser-os/desktop';
import { AppManifest } from '@browser-os/core';

export const defaultDesktopIcons: DesktopIcon[] = [
  { id: '1', label: 'Files', icon: '📁', appId: 'files', x: 50, y: 50 },
  { id: '2', label: 'Terminal', icon: '💻', appId: 'terminal', x: 50, y: 150 },
  { id: '3', label: 'Word Processor', icon: '📝', appId: 'os.word-processor', x: 50, y: 250 },
  { id: '4', label: 'Notepad', icon: '📄', appId: 'notes', x: 50, y: 350 },
  { id: '5', label: 'Calculator', icon: '🔢', appId: 'calculator', x: 50, y: 450 },
  { id: '6', label: 'Monitor', icon: '📊', appId: 'monitor', x: 50, y: 550 },
  { id: '7', label: 'Settings', icon: '⚙️', appId: 'settings', x: 50, y: 650 },
];

export const defaultApps: AppManifest[] = [
  // Default apps can be registered here if needed
  // For now, apps are registered via hardcoded components in AppRenderer
];

