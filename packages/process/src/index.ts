import { createId } from '@browser-os/core';
import { eventBus, ProcessEvent, ProcessState } from '@browser-os/core';
import './commands'; // Register built-in commands

export type Pid = string;

export interface ProcessStreams {
  stdin: WritableStream<string>;
  stdout: ReadableStream<string>;
  stderr: ReadableStream<string>;
}

export interface Process {
  pid: Pid;
  appId?: string; // For app processes
  command?: string; // For command processes
  args?: string[]; // Command arguments
  state: ProcessState;
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

class ProcessManager {
  private processes: Map<Pid, Process> = new Map();
  private commands: Map<string, CommandHandler> = new Map();
  private nextPidCounter = 1;

  constructor() {
    // Built-in commands are registered via commands.ts import
  }

  registerCommand(handler: CommandHandler): void {
    this.commands.set(handler.name, handler);
  }

  getCommand(name: string): CommandHandler | undefined {
    return this.commands.get(name);
  }

  getAllCommands(): CommandHandler[] {
    return Array.from(this.commands.values());
  }

  spawnApp(appId: string, parentPid?: Pid): Pid {
    const pid = createId();
    const proc: Process = {
      pid,
      appId,
      state: 'starting',
      startedAt: Date.now(),
      channels: {},
      children: new Set(),
      parentPid,
      env: {},
    };

    if (parentPid) {
      const parent = this.processes.get(parentPid);
      if (parent) {
        parent.children.add(pid);
      }
    }

    this.processes.set(pid, proc);
    eventBus.emit('proc', { type: 'spawn', pid, appId });
    
    setTimeout(() => {
      proc.state = 'running';
    }, 100);
    
    return pid;
  }

  async executeCommand(
    command: string,
    args: string[],
    options?: {
      cwd?: string;
      env?: Record<string, string>;
      parentPid?: Pid;
      stdin?: ReadableStream<string>;
    }
  ): Promise<Pid> {
    const pid = createId();
    const handler = this.commands.get(command);

    if (!handler) {
      throw new Error(`Command not found: ${command}`);
    }

    // Create streams
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    
    const stdout = new ReadableStream<string>({
      start(controller) {
        // Stream will be populated by command execution
      },
    });

    const stderr = new ReadableStream<string>({
      start(controller) {
        // Stream will be populated by command execution
      },
    });

    const stdin = new WritableStream<string>({
      write(chunk) {
        // Handle stdin input
      },
    });

    const streams: ProcessStreams = { stdin, stdout, stderr };

    const proc: Process = {
      pid,
      command,
      args,
      state: 'starting',
      startedAt: Date.now(),
      channels: {},
      children: new Set(),
      parentPid: options?.parentPid,
      cwd: options?.cwd || 'vfs://documents/',
      env: { ...options?.env },
      streams,
    };

    if (options?.parentPid) {
      const parent = this.processes.get(options.parentPid);
      if (parent) {
        parent.children.add(pid);
      }
    }

    this.processes.set(pid, proc);
    eventBus.emit('proc', { type: 'spawn', pid, appId: command });

    // Execute command asynchronously
    (async () => {
      try {
        proc.state = 'running';
        const exitCode = await handler.execute(
          args || [],
          streams,
          proc.cwd!,
          proc.env || {}
        );
        proc.exitCode = exitCode;
        proc.state = exitCode === 0 ? 'stopped' : 'crashed';
        eventBus.emit('proc', { type: 'kill', pid });
      } catch (error: any) {
        proc.exitCode = 1;
        proc.state = 'crashed';
        eventBus.emit('proc', { type: 'crash', pid, error: error.message });
      }
    })();

    return pid;
  }

  kill(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc) {
      // Kill all children first
      proc.children.forEach(childPid => this.kill(childPid));
      
      proc.state = 'stopped';
      this.processes.delete(pid);
      
      // Remove from parent's children
      if (proc.parentPid) {
        const parent = this.processes.get(proc.parentPid);
        if (parent) {
          parent.children.delete(pid);
        }
      }
      
      eventBus.emit('proc', { type: 'kill', pid });
    }
  }

  suspend(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc && proc.state === 'running') {
      proc.state = 'suspended';
      eventBus.emit('proc', { type: 'suspend', pid });
    }
  }

  resume(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc && proc.state === 'suspended') {
      proc.state = 'running';
      eventBus.emit('proc', { type: 'resume', pid });
    }
  }

  getProcess(pid: Pid): Process | undefined {
    return this.processes.get(pid);
  }

  getAllProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  send(pid: Pid, topic: string, msg: any): void {
    const proc = this.processes.get(pid);
    if (proc && proc.channels[topic]) {
      proc.channels[topic](msg);
    }
  }

  // For testing
  _reset(): void {
    this.processes.clear();
  }
}

export const processManager = new ProcessManager();

export function spawn(appId: string, parentPid?: Pid): Pid {
  return processManager.spawnApp(appId, parentPid);
}

export function executeCommand(
  command: string,
  args: string[],
  options?: {
    cwd?: string;
    env?: Record<string, string>;
    parentPid?: Pid;
  }
): Promise<Pid> {
  return processManager.executeCommand(command, args, options);
}

export function kill(pid: Pid): void {
  processManager.kill(pid);
}

export function send(pid: Pid, topic: string, msg: any): void {
  processManager.send(pid, topic, msg);
}

export function registerCommand(handler: CommandHandler): void {
  processManager.registerCommand(handler);
}

export function getCommand(name: string): CommandHandler | undefined {
  return processManager.getCommand(name);
}
