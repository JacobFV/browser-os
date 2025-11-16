/**
 * Process API for processes to query process information
 */

export interface ProcessInfo {
  pid: number;
  ppid: number | null;
  name: string;
  status: 'running' | 'stopped' | 'terminated';
  cwd: string;
}

/**
 * Process API factory
 */
export class ProcessAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Get current process info
   */
  async getSelf(): Promise<ProcessInfo> {
    return (await this.syscall('process.getSelf', {})) as ProcessInfo;
  }

  /**
   * Get process info by PID
   */
  async get(pid: number): Promise<ProcessInfo | null> {
    return (await this.syscall('process.get', { pid })) as ProcessInfo | null;
  }

  /**
   * List all processes (or just own process if no permission)
   */
  async list(): Promise<ProcessInfo[]> {
    return (await this.syscall('process.list', {})) as ProcessInfo[];
  }

  /**
   * Get environment variables for current process
   */
  async getEnv(): Promise<Record<string, string>> {
    return (await this.syscall('process.getEnv', {})) as Record<string, string>;
  }
}

