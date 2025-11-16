import type { ProcessManager } from '@browser-os/proc';
import type { SyscallHandler } from '../types';

export function createProcessSyscalls(procManager: ProcessManager): Record<string, SyscallHandler> {
  return {
    'process.getSelf': async (args, context) => {
      const process = procManager.get(context.pid);
      if (!process) {
        throw new Error('Process not found');
      }

      // Return sanitized process info
      return {
        pid: process.pid,
        ppid: process.ppid,
        name: process.name,
        status: process.status,
        cwd: process.cwd,
        // Don't expose env for security reasons unless explicitly requested
      };
    },

    'process.get': async (args, context) => {
      const pid = args.pid as number;
      if (typeof pid !== 'number') {
        throw new Error('pid must be a number');
      }

      const process = procManager.get(pid);
      if (!process) {
        return null;
      }

      // Only allow getting info for own process or with special permission
      if (pid !== context.pid && !context.canSyscall('process.get.any')) {
        throw new Error('Permission denied: cannot get info for other processes');
      }

      // Return sanitized process info
      return {
        pid: process.pid,
        ppid: process.ppid,
        name: process.name,
        status: process.status,
        cwd: process.cwd,
      };
    },

    'process.list': async (args, context) => {
      // Check permission to list all processes
      if (!context.canSyscall('process.list.all')) {
        // Only return own process
        const process = procManager.get(context.pid);
        if (!process) {
          return [];
        }
        return [
          {
            pid: process.pid,
            ppid: process.ppid,
            name: process.name,
            status: process.status,
            cwd: process.cwd,
          },
        ];
      }

      // Return all processes
      const processes = procManager.list();
      return processes.map((p) => ({
        pid: p.pid,
        ppid: p.ppid,
        name: p.name,
        status: p.status,
        cwd: p.cwd,
      }));
    },

    'process.getEnv': async (args, context) => {
      const process = procManager.get(context.pid);
      if (!process) {
        throw new Error('Process not found');
      }

      // Return own environment variables
      return process.env;
    },
  };
}

