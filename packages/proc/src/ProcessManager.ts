import { EventBus, Channel } from '@browser-os/events';
import type { FileSystem } from '@browser-os/fs';
import { Process } from './Process';
import { Executor } from './Executor';
import { WindowAPI } from './WindowAPI';
import { NotificationAPI } from './NotificationAPI';
import { DialogAPI } from './DialogAPI';
import { ClipboardAPI } from './ClipboardAPI';
import { StorageAPI } from './StorageAPI';
import { ProcessAPI } from './ProcessAPI';
import { NetworkAPI } from './NetworkAPI';
import { SystemInfoAPI } from './SystemInfoAPI';
import { PowerAPI } from './PowerAPI';
import { AudioAPI } from './AudioAPI';
import { MediaAPI } from './MediaAPI';
import { LocationAPI } from './LocationAPI';
import { SensorAPI } from './SensorAPI';
import type { ProcessOptions, OSAPI } from './types';

export interface ProcessManagerOptions {
  eventBus: EventBus;
  fs: FileSystem;
  syscallHandler?: (pid: number, syscall: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Manages process lifecycle
 */
export class ProcessManager {
  private processes: Map<number, Process> = new Map();
  private nextPid: number = 1;
  private executor: Executor;
  private eventBus: EventBus;
  private fs: FileSystem;
  private syscallHandler?: (pid: number, syscall: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(options: ProcessManagerOptions) {
    this.eventBus = options.eventBus;
    this.fs = options.fs;
    this.syscallHandler = options.syscallHandler;
    this.executor = new Executor();
  }

  /**
   * Spawn a new process
   */
  async spawn(
    appId: string,
    args: string[] = [],
    options?: ProcessOptions
  ): Promise<Process> {
    const pid = this.nextPid++;
    const name = appId;
    const cwd = options?.cwd ?? '/home/user';
    const env = { ...options?.env };
    const ppid = options?.ppid ?? null;

    // Create IPC channel for this process
    const channel = new Channel(`proc:${pid}`, this.eventBus);

    // Create process instance
    const process = new Process(pid, name, cwd, env, channel, ppid);
    this.processes.set(pid, process);

    // Emit process spawned event
    this.eventBus.emit('proc:spawned', { pid, appId, args }, { source: 'proc' });

    // Load app code from filesystem
    const appPath = `/bin/${appId}.js`;
    let code: string;
    try {
      const codeBytes = await this.fs.read(appPath);
      code = new TextDecoder().decode(codeBytes);
    } catch (error) {
      process.terminate();
      throw new Error(`Failed to load app ${appId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Create syscall wrapper
    const syscallWrapper = async (name: string, syscallArgs: Record<string, unknown>) => {
      if (!this.syscallHandler) {
        throw new Error('Syscall handler not configured');
      }
      return this.syscallHandler(pid, name, syscallArgs);
    };

    // Create OS API for the process
    const osApi: OSAPI = {
      pid,
      cwd,
      env,
      syscall: syscallWrapper,
      channel,
      window: new WindowAPI(syscallWrapper),
      notification: new NotificationAPI(syscallWrapper),
      dialog: new DialogAPI(syscallWrapper),
      clipboard: new ClipboardAPI(syscallWrapper),
      storage: new StorageAPI(syscallWrapper),
      process: new ProcessAPI(syscallWrapper),
      network: new NetworkAPI(syscallWrapper),
      system: new SystemInfoAPI(syscallWrapper),
      power: new PowerAPI(syscallWrapper),
      audio: new AudioAPI(syscallWrapper),
      media: new MediaAPI(syscallWrapper),
      location: new LocationAPI(syscallWrapper),
      sensor: new SensorAPI(syscallWrapper),
    };

    // Execute app code asynchronously
    this.executor.exec(code, osApi).catch((error) => {
      console.error(`[PID ${pid}] Process error:`, error);
      process.terminate();
      this.eventBus.emit('proc:error', { pid, error: error instanceof Error ? error.message : String(error) }, { source: 'proc' });
    });

    return process;
  }

  /**
   * Kill a process
   */
  async kill(pid: number, signal: 'SIGTERM' | 'SIGKILL' = 'SIGTERM'): Promise<void> {
    const process = this.processes.get(pid);
    if (!process) {
      throw new Error(`Process ${pid} not found`);
    }

    if (signal === 'SIGKILL') {
      process.terminate();
    } else {
      // SIGTERM - try graceful shutdown
      this.eventBus.emit('proc:terminate', { pid }, { target: `proc:${pid}` });
      // Give process a moment to clean up
      await new Promise((resolve) => setTimeout(resolve, 100));
      process.terminate();
    }

    this.processes.delete(pid);
    this.eventBus.emit('proc:terminated', { pid }, { source: 'proc' });
  }

  /**
   * Get a process by PID
   */
  get(pid: number): Process | null {
    return this.processes.get(pid) ?? null;
  }

  /**
   * List all processes
   */
  list(): Process[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get IPC channel for a process
   */
  getChannel(pid: number): Channel | null {
    const process = this.processes.get(pid);
    return process?.channel ?? null;
  }
}

