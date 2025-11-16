import type { Process } from '@browser-os/schemas';
import type { Channel } from '@browser-os/events';
import type { WindowAPI } from './WindowAPI';
import type { NotificationAPI } from './NotificationAPI';
import type { DialogAPI } from './DialogAPI';
import type { ClipboardAPI } from './ClipboardAPI';
import type { StorageAPI } from './StorageAPI';
import type { ProcessAPI } from './ProcessAPI';
import type { NetworkAPI } from './NetworkAPI';
import type { SystemInfoAPI } from './SystemInfoAPI';
import type { PowerAPI } from './PowerAPI';
import type { AudioAPI } from './AudioAPI';

export interface ProcessOptions {
  cwd?: string;
  env?: Record<string, string>;
  ppid?: number;
}

export interface OSAPI {
  pid: number;
  cwd: string;
  env: Record<string, string>;
  syscall(name: string, args: Record<string, unknown>): Promise<unknown>;
  channel: Channel;
  window: WindowAPI;
  notification: NotificationAPI;
  dialog: DialogAPI;
  clipboard: ClipboardAPI;
  storage: StorageAPI;
  process: ProcessAPI;
  network: NetworkAPI;
  system: SystemInfoAPI;
  power: PowerAPI;
  audio: AudioAPI;
}

