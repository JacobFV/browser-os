export type Pid = string;

export interface ProcessStreams {
  stdin: WritableStream<string>;
  stdout: WritableStream<string>; // Commands write to stdout
  stderr: WritableStream<string>; // Commands write to stderr
}

export interface Process {
  pid: Pid;
  appId?: string; // For app processes
  command?: string; // For command processes
  args?: string[]; // Command arguments
  state: import('@browser-os/core').ProcessState;
  startedAt: number;
  exitCode?: number;
  cpu?: number;
  mem?: number;
  channels: Record<string, (msg: any) => void>;
  cwd?: string; // Working directory
  env?: Record<string, string>; // Environment variables
  parentPid?: Pid; // Parent process
  children: Set<Pid>; // Child processes
  streams?: ProcessStreams; // STDIN/STDOUT/STDERR
  windowId?: string; // Window ID for app processes
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

