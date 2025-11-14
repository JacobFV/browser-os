import type { Process as ProcessSchema, ProcessStatus } from '@browser-os/schemas';
import { Channel } from '@browser-os/events';

export class Process implements ProcessSchema {
  pid: number;
  ppid: number | null;
  name: string;
  status: ProcessStatus;
  cwd: string;
  env: Record<string, string>;
  channel: Channel;

  constructor(
    pid: number,
    name: string,
    cwd: string,
    env: Record<string, string>,
    channel: Channel,
    ppid: number | null = null
  ) {
    this.pid = pid;
    this.ppid = ppid;
    this.name = name;
    this.status = 'running';
    this.cwd = cwd;
    this.env = env;
    this.channel = channel;
  }

  stop(): void {
    if (this.status === 'running') {
      this.status = 'stopped';
    }
  }

  resume(): void {
    if (this.status === 'stopped') {
      this.status = 'running';
    }
  }

  terminate(): void {
    this.status = 'terminated';
  }
}

