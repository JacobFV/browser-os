import { CommandHandler, ProcessStreams } from './types';
import { vfs } from '@browser-os/fs';
import { kill, getProcessByAppId } from './index';

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
  {
    name: 'kill',
    description: 'Kill a process',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'kill: missing operand\n');
        return 1;
      }
      
      const pid = args[0];
      try {
        kill(pid);
        await writeStdout(streams, `Killed process ${pid}\n`);
        return 0;
      } catch (error: any) {
        await writeStderr(streams, `kill: ${pid}: ${error.message}\n`);
        return 1;
      }
    },
  },
  {
    name: 'killall',
    description: 'Kill all processes with given app ID',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'killall: missing operand\n');
        return 1;
      }
      
      const appId = args[0];
      const processes = getProcessByAppId(appId);
      if (processes.length === 0) {
        await writeStderr(streams, `killall: no processes found for ${appId}\n`);
        return 1;
      }
      
      for (const proc of processes) {
        kill(proc.pid);
      }
      await writeStdout(streams, `Killed ${processes.length} process(es) for ${appId}\n`);
      return 0;
    },
  },
  {
    name: 'sleep',
    description: 'Sleep for specified seconds',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'sleep: missing operand\n');
        return 1;
      }
      
      const seconds = parseFloat(args[0]);
      if (isNaN(seconds) || seconds < 0) {
        await writeStderr(streams, `sleep: invalid time interval '${args[0]}'\n`);
        return 1;
      }
      
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return 0;
    },
  },
  {
    name: 'test',
    description: 'Evaluate conditional expression',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        return 1;
      }
      
      // Simple test implementation
      // test -f file: file exists and is regular file
      // test -d dir: dir exists and is directory
      // test -e path: path exists
      // test str1 = str2: strings are equal
      // test str1 != str2: strings are not equal
      
      let i = 0;
      const nextArg = () => args[i++];
      const peekArg = () => args[i];
      
      const arg = nextArg();
      
      if (arg === '-f') {
        const file = nextArg();
        if (!file) return 1;
        const filePath = file.startsWith('vfs://')
          ? file
          : cwd.endsWith('/')
            ? cwd + file
            : cwd + '/' + file;
        try {
          const stat = await vfs.stat(filePath);
          return stat.type === 'file' ? 0 : 1;
        } catch {
          return 1;
        }
      } else if (arg === '-d') {
        const dir = nextArg();
        if (!dir) return 1;
        const dirPath = dir.startsWith('vfs://')
          ? dir
          : cwd.endsWith('/')
            ? cwd + dir
            : cwd + '/' + dir;
        try {
          const stat = await vfs.stat(dirPath);
          return stat.type === 'directory' ? 0 : 1;
        } catch {
          return 1;
        }
      } else if (arg === '-e') {
        const path = nextArg();
        if (!path) return 1;
        const fullPath = path.startsWith('vfs://')
          ? path
          : cwd.endsWith('/')
            ? cwd + path
            : cwd + '/' + path;
        try {
          await vfs.stat(fullPath);
          return 0;
        } catch {
          return 1;
        }
      } else if (peekArg() === '=') {
        const str1 = arg;
        nextArg(); // consume '='
        const str2 = nextArg();
        return str1 === str2 ? 0 : 1;
      } else if (peekArg() === '!=') {
        const str1 = arg;
        nextArg(); // consume '!='
        const str2 = nextArg();
        return str1 !== str2 ? 0 : 1;
      } else {
        // Just test if arg is non-empty
        return arg ? 0 : 1;
      }
    },
  },
  {
    name: 'grep',
    description: 'Search for pattern in input',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'grep: missing pattern\n');
        return 1;
      }
      
      const pattern = args[0];
      const files = args.slice(1);
      const regex = new RegExp(pattern, 'g');
      
      let found = false;
      
      if (files.length === 0) {
        // Read from stdin (would need to be piped)
        await writeStderr(streams, 'grep: reading from stdin not yet supported\n');
        return 1;
      }
      
      for (const file of files) {
        const filePath = file.startsWith('vfs://')
          ? file
          : cwd.endsWith('/')
            ? cwd + file
            : cwd + '/' + file;
        
        try {
          const content = await vfs.read(filePath, { binary: false }) as string;
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              found = true;
              const output = files.length > 1 ? `${file}:${lines[i]}\n` : `${lines[i]}\n`;
              await writeStdout(streams, output);
            }
          }
        } catch (error: any) {
          await writeStderr(streams, `grep: ${file}: ${error.message}\n`);
        }
      }
      
      return found ? 0 : 1;
    },
  },
  {
    name: 'find',
    description: 'Find files',
    execute: async (args, streams, cwd, env) => {
      if (args.length < 2 || args[0] !== '.') {
        await writeStderr(streams, 'find: usage: find . -name <pattern>\n');
        return 1;
      }
      
      const nameIndex = args.indexOf('-name');
      if (nameIndex === -1 || nameIndex === args.length - 1) {
        await writeStderr(streams, 'find: missing -name pattern\n');
        return 1;
      }
      
      const pattern = args[nameIndex + 1];
      const searchPath = args[0] === '.' ? cwd : args[0];
      
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      
      const search = async (dir: string): Promise<void> => {
        try {
          const entries = await vfs.readdir(dir);
          for (const entry of entries) {
            const fullPath = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name;
            if (regex.test(entry.name)) {
              await writeStdout(streams, fullPath + '\n');
            }
            if (entry.stat.type === 'directory') {
              await search(fullPath);
            }
          }
        } catch (error: any) {
          // Skip directories we can't read
        }
      };
      
      await search(searchPath);
      return 0;
    },
  },
  {
    name: 'sort',
    description: 'Sort lines',
    execute: async (args, streams, cwd, env) => {
      // Read from stdin if no files specified (would need piping)
      // For now, just sort stdin
      await writeStderr(streams, 'sort: reading from stdin not yet supported\n');
      return 1;
    },
  },
  {
    name: 'uniq',
    description: 'Remove duplicate lines',
    execute: async (args, streams, cwd, env) => {
      // Read from stdin (would need piping)
      await writeStderr(streams, 'uniq: reading from stdin not yet supported\n');
      return 1;
    },
  },
  {
    name: 'wc',
    description: 'Word count',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'wc: missing file argument\n');
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
          const lines = content.split('\n').filter(l => l.length > 0);
          const words = content.split(/\s+/).filter(w => w.length > 0);
          const chars = content.length;
          
          await writeStdout(streams, `  ${lines.length}  ${words.length}  ${chars} ${file}\n`);
        } catch (error: any) {
          await writeStderr(streams, `wc: ${file}: ${error.message}\n`);
          return 1;
        }
      }
      return 0;
    },
  },
  {
    name: 'env',
    description: 'Show environment variables',
    execute: async (args, streams, cwd, env) => {
      const envStr = Object.entries(env)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') + '\n';
      await writeStdout(streams, envStr);
      return 0;
    },
  },
  {
    name: 'which',
    description: 'Find command location',
    execute: async (args, streams, cwd, env) => {
      if (args.length === 0) {
        await writeStderr(streams, 'which: missing command name\n');
        return 1;
      }
      
      const command = args[0];
      const { getAllCommands } = await import('./index');
      const commands = getAllCommands();
      const found = commands.find(cmd => cmd.name === command);
      
      if (found) {
        await writeStdout(streams, `${command}\n`);
        return 0;
      } else {
        await writeStderr(streams, `which: ${command}: not found\n`);
        return 1;
      }
    },
  },
];

