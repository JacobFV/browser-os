import type { Window } from '@browser-os/schemas';
import type { AppRegistryEntry } from '@browser-os/schemas';

export interface TaskbarWindow {
  windowId: string;
  appId?: string;
  title: string;
  isFocused: boolean;
  isMinimized: boolean;
}

export interface TaskbarShortcut {
  appId: string;
  name: string;
  icon?: string;
}

