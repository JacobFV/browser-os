import { createId } from '@browser-os/core';
import { eventBus, ProcessEvent, ProcessState } from '@browser-os/core';
import './commands'; // Register built-in commands

export type Pid = string;

export interface ProcessStreams {
  stdin: WritableStream<string>;
  stdout: WritableStream<string>; // Commands write to stdout
  stderr: WritableStream<string>; // Commands write to stderr
}

/**
 * Create paired streams for stdout/stderr
 * Returns both the writable side (for commands) and readable side (for terminal)
 */
export function createPairedStreams(): {
  writable: WritableStream<string>;
  readable: ReadableStream<string>;
} {
  let controller: ReadableStreamDefaultController<string> | null = null;
  
  const readable = new ReadableStream<string>({
    start(c) {
      controller = c;
    },
  });
  
  const writable = new WritableStream<string>({
    write(chunk) {
      controller?.enqueue(chunk);
      return Promise.resolve();
    },
    close() {
      controller?.close();
    },
    abort(reason) {
      controller?.error(reason);
    },
  });
  
  return { writable, readable };
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
      timeout?: number; // Timeout in milliseconds
    }
  ): Promise<Pid> {
    const pid = createId();
    const handler = this.commands.get(command);

    if (!handler) {
      throw new Error(`Command not found: ${command}`);
    }

    // Create proper streams with backpressure handling
    // Commands write to stdout/stderr, so they need WritableStreams
    // Terminal reads from them, so we create paired streams
    const stdoutPair = createPairedStreams();
    const stderrPair = createPairedStreams();
    
    const stdin = new WritableStream<string>({
      write(chunk) {
        // Handle stdin input - will be connected by terminal
        return Promise.resolve();
      },
    });
    
    const stdinWriter = stdin.getWriter();

    const streams: ProcessStreams = { 
      stdin, 
      stdout: stdoutPair.writable, 
      stderr: stderrPair.writable 
    };

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
    
    // Store readable sides for terminal to read from
    (proc as any).stdoutReadable = stdoutPair.readable;
    (proc as any).stderrReadable = stderrPair.readable;

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
        const startTime = performance.now();
        const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
        
        // Pipe stdin if provided
        if (options?.stdin) {
          const reader = options.stdin.getReader();
          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                await stdinWriter.write(value);
              }
            } catch (e) {
              // Stream closed
            } finally {
              reader.releaseLock();
            }
          })();
        }
        
        // Set up timeout if specified
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        if (options?.timeout) {
          timeoutId = setTimeout(() => {
            if (proc.state === 'running') {
              this.kill(pid);
              eventBus.emit('proc', { type: 'kill', pid });
            }
          }, options.timeout);
        }
        
        const exitCode = await handler.execute(
          args || [],
          streams,
          proc.cwd!,
          proc.env || {}
        );
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Calculate metrics
        const endTime = performance.now();
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
        proc.cpu = endTime - startTime; // Execution time in ms
        proc.mem = Math.max(0, endMemory - startMemory); // Memory delta in bytes
        
        // Close streams - close writable side which will close readable side
        stdoutPair.writable.close();
        stderrPair.writable.close();
        stdinWriter.close();
        
        proc.exitCode = exitCode;
        proc.state = exitCode === 0 ? 'stopped' : 'crashed';
        eventBus.emit('proc', { type: 'kill', pid });
      } catch (error: any) {
        stdoutPair.writable.abort(error);
        stderrPair.writable.abort(error);
        stdinWriter.abort();
        proc.exitCode = 1;
        proc.state = 'crashed';
        eventBus.emit('proc', { type: 'crash', pid, error: error.message });
      } finally {
        stdinWriter.releaseLock();
      }
    })();

    return pid;
  }
  
  /**
   * Create streams that can be written to and read from
   * Used for piping between commands
   */
  createStreams(): {
    stdout: { writable: WritableStream<string>; readable: ReadableStream<string> };
    stderr: { writable: WritableStream<string>; readable: ReadableStream<string> };
    stdin: { stream: WritableStream<string>; writer: WritableStreamDefaultWriter<string> };
  } {
    const stdoutPair = createPairedStreams();
    const stderrPair = createPairedStreams();
    
    const stdin = new WritableStream<string>({
      write(chunk) {
        return Promise.resolve();
      },
    });
    
    const stdinWriter = stdin.getWriter();

    return {
      stdout: stdoutPair,
      stderr: stderrPair,
      stdin: { stream: stdin, writer: stdinWriter },
    };
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
    stdin?: ReadableStream<string>;
    timeout?: number;
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

export function getAllCommands(): CommandHandler[] {
  return processManager.getAllCommands();
}

export function getProcess(pid: Pid): Process | undefined {
  return processManager.getProcess(pid);
}

export function spawnApp(appId: string, parentPid?: Pid): Pid {
  return processManager.spawnApp(appId, parentPid);
}
