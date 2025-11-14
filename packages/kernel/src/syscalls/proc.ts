import type { ProcessManager } from '@browser-os/proc';
import type { SyscallHandler } from '../types';

export function createProcSyscalls(procManager: ProcessManager): Record<string, SyscallHandler> {
  return {
    'proc.spawn': async (args, context) => {
      const appId = args.appId as string;
      const processArgs = (args.args as string[]) ?? [];
      const options = args.options as Record<string, unknown> | undefined;

      if (!appId) throw new Error('appId required');

      const process = await procManager.spawn(appId, processArgs, {
        cwd: options?.cwd as string | undefined,
        env: options?.env as Record<string, string> | undefined,
        ppid: context.pid,
      });

      return {
        pid: process.pid,
        name: process.name,
        status: process.status,
      };
    },

    'proc.kill': async (args, context) => {
      const pid = args.pid as number;
      const signal = (args.signal as 'SIGTERM' | 'SIGKILL') ?? 'SIGTERM';

      if (typeof pid !== 'number') throw new Error('pid must be a number');

      // Only allow killing own processes or require special permission
      if (pid !== context.pid && !context.canSyscall('proc.kill.any')) {
        throw new Error('Permission denied: cannot kill other processes');
      }

      await procManager.kill(pid, signal);
      return null;
    },

    'proc.list': async (args, context) => {
      // Check permission
      if (!context.canSyscall('proc.list')) {
        throw new Error('Permission denied: cannot list processes');
      }

      const processes = procManager.list();
      return processes.map((p) => ({
        pid: p.pid,
        ppid: p.ppid,
        name: p.name,
        status: p.status,
        cwd: p.cwd,
      }));
    },

    'proc.get': async (args, context) => {
      const pid = args.pid as number;
      if (typeof pid !== 'number') throw new Error('pid must be a number');

      // Only allow getting own process info or require permission
      if (pid !== context.pid && !context.canSyscall('proc.get.any')) {
        throw new Error('Permission denied: cannot get other process info');
      }

      const process = procManager.get(pid);
      if (!process) {
        return null;
      }

      return {
        pid: process.pid,
        ppid: process.ppid,
        name: process.name,
        status: process.status,
        cwd: process.cwd,
      };
    },
  };
}

