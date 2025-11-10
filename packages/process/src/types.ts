import type { Pid, AppId, WindowId } from '@browser-os/core';

export type { Pid, AppId, WindowId };

export interface ProcessStreams {
  stdin: WritableStream<string>;
  stdout: WritableStream<string>; // Commands write to stdout
  stderr: WritableStream<string>; // Commands write to stderr
}

export interface ProcessMessage {
  type: string;
  data?: unknown;
}

export interface Process {
  pid: Pid;
  appId?: AppId; // For app processes
  command?: string; // For command processes
  args?: string[]; // Command arguments
  state: import('@browser-os/core').ProcessState;
  startedAt: number;
  exitCode?: number;
  cpu?: number;
  mem?: number;
  channels: Record<string, (msg: ProcessMessage) => void>;
  cwd?: string; // Working directory
  env?: Record<string, string>; // Environment variables
  parentPid?: Pid; // Parent process
  children: Set<Pid>; // Child processes
  streams?: ProcessStreams; // STDIN/STDOUT/STDERR
  windowId?: WindowId; // Window ID for app processes
}

export interface CommandHandler {
  name: string;
  description?: string;
  execute: (
    args: string[],
    streams: ProcessStreams,
    cwd: string,
    env: Record<string, string>
  ) => Promise<number>; // Returns exit code
}

