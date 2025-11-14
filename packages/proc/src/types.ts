import type { Process } from '@browser-os/schemas';
import type { Channel } from '@browser-os/events';

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
}

