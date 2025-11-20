import type { ProcessStatus } from '@browser-os/schemas';

export interface ProcessInfo {
  pid: number;
  ppid: number | null;
  name: string;
  status: ProcessStatus;
  cwd: string;
  env?: Record<string, string>;
}

export interface ProcessManagerProps {
  windowId: string;
  appId: string;
  eventBus: any;
}

export type SortColumn = 'pid' | 'name' | 'ppid' | 'status' | 'cwd';
export type SortDirection = 'asc' | 'desc';

