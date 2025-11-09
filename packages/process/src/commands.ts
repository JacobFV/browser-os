import { CommandHandler, ProcessStreams } from './index';
import { vfs } from '@browser-os/fs';

// Helper to write to stdout
async function writeStdout(streams: ProcessStreams, text: string): Promise<void> {
  const writer = streams.stdout.getWriter();
  try {
    await writer.write(text);
  } finally {
    writer.releaseLock();
  }
}

// Helper to write to stderr
async function writeStderr(streams: ProcessStreams, text: string): Promise<void> {
  const writer = streams.stderr.getWriter();
  try {
    await writer.write(text);
  } finally {
    writer.releaseLock();
  }
}

// Export built-in command handlers
export const builtInCommands: CommandHandler[] = [
  {
    name: 'cd',
    description: 'Change directory',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStdout(streams, cwd + '\n');
        return 0;
      }
      const targetPath = args[0].startsWith('vfs://') 
        ? args[0] 
        : cwd.endsWith('/') 
          ? cwd + args[0]
          : cwd + '/' + args[0];
      
      try {
        const stat = await vfs.stat(targetPath);
        if (stat.type === 'directory') {
          await writeStdout(streams, targetPath + '\n');
          return 0;
        } else {
          await writeStderr(streams, `cd: ${args[0]}: Not a directory\n`);
          return 1;
        }
      } catch (error: any) {
        await writeStderr(streams, `cd: ${args[0]}: ${error.message}\n`);
        return 1;
      }
    },
  },
  {
    name: 'ls',
    description: 'List directory contents',
    execute: async (args, streams, cwd, env) => {
      const targetPath = args.length > 0
        ? (args[0].startsWith('vfs://') ? args[0] : (cwd.endsWith('/') ? cwd + args[0] : cwd + '/' + args[0]))
        : cwd;
      
      try {
        const entries = await vfs.readdir(targetPath);
        const output = entries.map((e: { name: string }) => e.name).join('  ') + '\n';
        await writeStdout(streams, output);
        return 0;
      } catch (error: any) {
        await writeStderr(streams, `ls: ${error.message}\n`);
        return 1;
      }
    },
  },
  {
    name: 'pwd',
    description: 'Print working directory',
    execute: async (args, streams, cwd, env) => {
      await writeStdout(streams, cwd + '\n');
      return 0;
    },
  },
  {
    name: 'cat',
    description: 'Display file contents',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'cat: missing file argument\n');
        return 1;
      }
      
      for (const file of args) {
        const filePath = file.startsWith('vfs://')
          ? file
          : cwd.endsWith('/')
            ? cwd + file
            : cwd + '/' + file;
        
        try {
          const content = await vfs.read(filePath, { binary: false }) as string;
          await writeStdout(streams, content + '\n');
        } catch (error: any) {
          await writeStderr(streams, `cat: ${file}: ${error.message}\n`);
          return 1;
        }
      }
      return 0;
    },
  },
  {
    name: 'echo',
    description: 'Print text',
    execute: async (args, streams, cwd, env) => {
      const text = args.join(' ') + '\n';
      await writeStdout(streams, text);
      return 0;
    },
  },
  {
    name: 'mkdir',
    description: 'Create directory',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'mkdir: missing operand\n');
        return 1;
      }
      
      for (const dir of args) {
        const dirPath = dir.startsWith('vfs://')
          ? dir
          : cwd.endsWith('/')
            ? cwd + dir
            : cwd + '/' + dir;
        
        try {
          const markerPath = dirPath.endsWith('/') ? dirPath + '.dir' : dirPath + '/.dir';
          await vfs.write(markerPath, '');
          await writeStdout(streams, `Created directory: ${dirPath}\n`);
        } catch (error: any) {
          await writeStderr(streams, `mkdir: ${dir}: ${error.message}\n`);
          return 1;
        }
      }
      return 0;
    },
  },
  {
    name: 'rm',
    description: 'Remove file or directory',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'rm: missing operand\n');
        return 1;
      }
      
      const recursive = args.includes('-r') || args.includes('-R');
      const files = args.filter(arg => !arg.startsWith('-'));
      
      for (const file of files) {
        const filePath = file.startsWith('vfs://')
          ? file
          : cwd.endsWith('/')
            ? cwd + file
            : cwd + '/' + file;
        
        try {
          await vfs.rm(filePath, { recursive });
          await writeStdout(streams, `Removed: ${filePath}\n`);
        } catch (error: any) {
          await writeStderr(streams, `rm: ${file}: ${error.message}\n`);
          return 1;
        }
      }
      return 0;
    },
  },
  {
    name: 'ps',
    description: 'List processes',
    execute: async (args, streams, cwd, env) => {
      // Import processManager dynamically to avoid circular dependency
      const { processManager } = await import('./index');
      const processes = Array.from(processManager['processes'].values());
      
      let output = 'PID\t\tAPP/CMD\t\tSTATE\t\tSTARTED\n';
      processes.forEach(proc => {
        const name = proc.appId || proc.command || 'unknown';
        const started = new Date(proc.startedAt).toLocaleTimeString();
        output += `${proc.pid}\t${name}\t\t${proc.state}\t\t${started}\n`;
      });
      
      await writeStdout(streams, output);
      return 0;
    },
  },
  {
    name: 'clear',
    description: 'Clear terminal',
    execute: async (args, streams, cwd, env) => {
      await writeStdout(streams, '\x1b[2J\x1b[H');
      return 0;
    },
  },
];

