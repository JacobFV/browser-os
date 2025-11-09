import { Window } from '@browser-os/windowing';
import { ProcessManager, ProcessStreams, createPairedStreams } from '@browser-os/process';
import type { Pid } from '@browser-os/process';
import { VfsImpl } from '@browser-os/fs';

/**
 * Simple event emitter for shell output/error events
 */
class EventEmitter<T> {
  private listeners: Set<(data: T) => void> = new Set();
  
  on(callback: (data: T) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  emit(data: T): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
  
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

interface ParsedCommandLine {
  commands: Array<{ command: string; args: string[] }>;
  background: boolean;
  stdoutRedirect?: { file: string; append: boolean };
  stdinRedirect?: string;
}

/**
 * Shell process logic - separated from React component
 * Handles command parsing, execution, state management
 */
export class ShellProcess {
  private cwd: string;
  private history: string[] = [];
  private env: Map<string, string> = new Map();
  private pid?: Pid;
  
  // Event emitters for UI subscription
  private outputEmitter = new EventEmitter<string>();
  private errorEmitter = new EventEmitter<string>();
  
  constructor(
    private processManager: ProcessManager,
    private vfs: VfsImpl,
    initialDir: string = 'vfs://documents/'
  ) {
    this.cwd = initialDir;
    this.pid = processManager.spawnApp('terminal-shell');
    
    // Initialize environment
    this.env.set('HOME', 'vfs://documents/');
    this.env.set('PATH', 'vfs://bin/');
    
    // Update process cwd
    const proc = this.processManager.getProcess(this.pid);
    if (proc) {
      proc.cwd = this.cwd;
      proc.env = this.getEnv();
    }
  }
  
  /**
   * Execute a command line (supports pipes, redirections, etc.)
   */
  async executeCommandLine(line: string): Promise<void> {
    const parsed = this.parseCommandLine(line);
    
    // Expand environment variables
    parsed.commands = parsed.commands.map(cmd => ({
      command: this.expandEnvVars(cmd.command, this.getEnv()),
      args: cmd.args.map(arg => this.expandEnvVars(arg, this.getEnv())),
    }));
    
    if (parsed.stdoutRedirect) {
      parsed.stdoutRedirect.file = this.expandEnvVars(parsed.stdoutRedirect.file, this.getEnv());
    }
    if (parsed.stdinRedirect) {
      parsed.stdinRedirect = this.expandEnvVars(parsed.stdinRedirect, this.getEnv());
    }
    
    if (parsed.commands.length === 0) return;
    
    // Handle built-in shell commands
    if (parsed.commands.length === 1 && !parsed.stdoutRedirect && !parsed.stdinRedirect && !parsed.background) {
      const { command, args } = parsed.commands[0];
      
      if (command === 'cd') {
        await this.handleCd(args);
        return;
      }
      
      if (command === 'help') {
        this.outputEmitter.emit(this.formatHelp());
        return;
      }
      
      if (command === 'exit') {
        this.outputEmitter.emit('Goodbye!\n');
        return;
      }
    }
    
    // Execute command(s)
    await this.executeCommands(parsed);
  }
  
  /**
   * Parse command line for pipes, redirections, background execution
   */
  parseCommandLine(line: string): ParsedCommandLine {
    const trimmed = line.trim();
    const background = trimmed.endsWith('&');
    const lineWithoutBg = background ? trimmed.slice(0, -1).trim() : trimmed;
    
    // Check for output redirection (> or >>)
    let stdoutRedirect: { file: string; append: boolean } | undefined;
    let stdinRedirect: string | undefined;
    let commandPart = lineWithoutBg;
    
    // Check for >> (append) first, then >
    const appendMatch = commandPart.match(/(.+?)\s*>>\s*(.+)/);
    if (appendMatch) {
      commandPart = appendMatch[1].trim();
      stdoutRedirect = { file: appendMatch[2].trim(), append: true };
    } else {
      const redirectMatch = commandPart.match(/(.+?)\s*>\s*(.+)/);
      if (redirectMatch) {
        commandPart = redirectMatch[1].trim();
        stdoutRedirect = { file: redirectMatch[2].trim(), append: false };
      }
    }
    
    // Check for input redirection (<)
    const stdinMatch = commandPart.match(/(.+?)\s*<\s*(.+)/);
    if (stdinMatch) {
      commandPart = stdinMatch[1].trim();
      stdinRedirect = stdinMatch[2].trim();
    }
    
    // Split by pipes
    const pipeParts = commandPart.split('|').map(p => p.trim());
    const commands = pipeParts.map(part => {
      const cmdParts = part.split(/\s+/);
      return {
        command: cmdParts[0],
        args: cmdParts.slice(1),
      };
    });
    
    return { commands, background, stdoutRedirect, stdinRedirect };
  }
  
  /**
   * Expand environment variables in text
   */
  expandEnvVars(text: string, env: Record<string, string>): string {
    return text.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, braced, simple) => {
      const varName = braced || simple;
      return env[varName] || '';
    });
  }
  
  /**
   * Change directory
   */
  async changeDirectory(path: string): Promise<void> {
    if (path.length === 0) {
      this.outputEmitter.emit(this.cwd + '\n');
      return;
    }
    
    const targetPath = path.startsWith('vfs://')
      ? path
      : this.cwd.endsWith('/')
        ? this.cwd + path
        : this.cwd + '/' + path;
    
    try {
      const stat = await this.vfs.stat(targetPath);
      if (stat.type === 'directory') {
        const newDir = targetPath.endsWith('/') ? targetPath : targetPath + '/';
        this.cwd = newDir;
        
        // Update process cwd
        if (this.pid) {
          const proc = this.processManager.getProcess(this.pid);
          if (proc) {
            proc.cwd = this.cwd;
          }
        }
      } else {
        this.errorEmitter.emit(`cd: ${path}: Not a directory\n`);
      }
    } catch (error: any) {
      this.errorEmitter.emit(`cd: ${path}: ${error.message}\n`);
    }
  }
  
  /**
   * Add command to history
   */
  addToHistory(command: string): void {
    this.history.push(command);
  }
  
  /**
   * Get command history
   */
  getHistory(): string[] {
    return [...this.history];
  }
  
  /**
   * Get current working directory
   */
  getCwd(): string {
    return this.cwd;
  }
  
  /**
   * Get environment variables
   */
  getEnv(): Record<string, string> {
    return Object.fromEntries(this.env);
  }
  
  /**
   * Set environment variable
   */
  setEnv(key: string, value: string): void {
    this.env.set(key, value);
    
    // Update process env
    if (this.pid) {
      const proc = this.processManager.getProcess(this.pid);
      if (proc) {
        proc.env = this.getEnv();
      }
    }
  }
  
  /**
   * Subscribe to output events
   */
  onOutput(callback: (data: string) => void): () => void {
    return this.outputEmitter.on(callback);
  }
  
  /**
   * Subscribe to error events
   */
  onError(callback: (data: string) => void): () => void {
    return this.errorEmitter.on(callback);
  }
  
  /**
   * Get prompt string
   */
  getPrompt(): string {
    const dirName = this.cwd.split('/').filter(Boolean).pop() || '/';
    return `\x1b[32muser@browser-os\x1b[0m:\x1b[34m${dirName}\x1b[0m$ `;
  }
  
  /**
   * Cleanup shell process
   */
  cleanup(): void {
    if (this.pid) {
      this.processManager.kill(this.pid);
      this.pid = undefined;
    }
    this.outputEmitter.removeAllListeners();
    this.errorEmitter.removeAllListeners();
  }
  
  // Private helper methods
  private async handleCd(args: string[]): Promise<void> {
    const path = args.length > 0 ? args[0] : '';
    await this.changeDirectory(path);
  }
  
  private formatHelp(): string {
    let help = 'Available commands:\n';
    const commands = this.processManager.getAllCommands();
    commands.forEach((cmd: { name: string; description?: string }) => {
      help += `  ${cmd.name.padEnd(12)} - ${cmd.description || ''}\n`;
    });
    help += '  cd <dir>      - Change directory\n';
    help += '  help          - Show this help\n';
    help += '  exit          - Exit terminal\n';
    return help;
  }
  
  private async executeCommands(parsed: ParsedCommandLine): Promise<void> {
    const commandCwd = this.cwd;
    const env = this.getEnv();
    
    // Handle stdin redirection - create a readable stream from file
    let stdinSource: ReadableStream<string> | undefined;
    if (parsed.stdinRedirect) {
      try {
        const filePath = parsed.stdinRedirect.startsWith('vfs://')
          ? parsed.stdinRedirect
          : commandCwd.endsWith('/')
            ? commandCwd + parsed.stdinRedirect
            : commandCwd + '/' + parsed.stdinRedirect;
        const content = await this.vfs.read(filePath, { binary: false }) as string;
        stdinSource = new ReadableStream({
          start(controller) {
            controller.enqueue(content);
            controller.close();
          },
        });
      } catch (error: any) {
        this.errorEmitter.emit(`Error reading file: ${parsed.stdinRedirect}: ${error.message}\n`);
        return;
      }
    }
    
    // Execute commands in pipe chain
    let previousStdout: ReadableStream<string> | undefined = stdinSource;
    const commandPromises: Promise<number>[] = [];
    
    for (let i = 0; i < parsed.commands.length; i++) {
      const { command, args } = parsed.commands[i];
      const isLast = i === parsed.commands.length - 1;
      
      const handler = this.processManager.getCommand(command);
      if (!handler) {
        this.errorEmitter.emit(`Command not found: ${command}\n`);
        return;
      }
      
      // Create streams for this command
      const stdoutPair = createPairedStreams();
      const stderrPair = createPairedStreams();
      
      // Create stdin stream - pipe from previous stdout if available
      const stdin = new WritableStream<string>({
        write(chunk) {
          return Promise.resolve();
        },
      });
      
      // Pipe previous stdout to this stdin
      if (previousStdout) {
        const reader = previousStdout.getReader();
        const writer = stdin.getWriter();
        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              await writer.write(value);
            }
            await writer.close();
          } catch (e) {
            // Stream closed
          } finally {
            reader.releaseLock();
            writer.releaseLock();
          }
        })();
      }
      
      const streams: ProcessStreams = {
        stdin,
        stdout: stdoutPair.writable,
        stderr: stderrPair.writable,
      };
      
      // For last command, read output
      if (isLast) {
        const stdoutReader = stdoutPair.readable.getReader();
        const stderrReader = stderrPair.readable.getReader();
        
        const readStdout = async () => {
          try {
            let output = '';
            while (true) {
              const { done, value } = await stdoutReader.read();
              if (done) break;
              output += value;
            }
            
            // Handle output redirection or write to terminal
            if (parsed.stdoutRedirect) {
              const filePath = parsed.stdoutRedirect.file.startsWith('vfs://')
                ? parsed.stdoutRedirect.file
                : commandCwd.endsWith('/')
                  ? commandCwd + parsed.stdoutRedirect.file
                  : commandCwd + '/' + parsed.stdoutRedirect.file;
              
              try {
                if (parsed.stdoutRedirect.append) {
                  const existing = await this.vfs.read(filePath, { binary: false }).catch(() => '') as string;
                  await this.vfs.write(filePath, existing + output);
                } else {
                  await this.vfs.write(filePath, output);
                }
              } catch (error: any) {
                this.errorEmitter.emit(`Error writing to file: ${error.message}\n`);
              }
            } else {
              this.outputEmitter.emit(output);
            }
          } catch (e) {
            // Stream closed
          } finally {
            stdoutReader.releaseLock();
          }
        };
        
        const readStderr = async () => {
          try {
            while (true) {
              const { done, value } = await stderrReader.read();
              if (done) break;
              this.errorEmitter.emit(`\x1b[31m${value}\x1b[0m`); // Red for stderr
            }
          } catch (e) {
            // Stream closed
          } finally {
            stderrReader.releaseLock();
          }
        };
        
        Promise.all([readStdout(), readStderr()]);
      }
      
      // Execute command
      const exitCodePromise = handler.execute(args, streams, commandCwd, env);
      commandPromises.push(exitCodePromise);
      
      // Set stdout for next command
      previousStdout = stdoutPair.readable;
    }
    
    // Wait for all commands to complete (unless background)
    if (!parsed.background) {
      await Promise.all(commandPromises);
    }
  }
  
  /**
   * Execute a single command (no pipes)
   */
  async executeSingleCommand(command: string, args: string[]): Promise<void> {
    const handler = this.processManager.getCommand(command);
    if (!handler) {
      this.errorEmitter.emit(`Command not found: ${command}\n`);
      this.errorEmitter.emit(`Type "help" for available commands.\n`);
      return;
    }
    
    const stdoutPair = createPairedStreams();
    const stderrPair = createPairedStreams();
    
    const stdin = new WritableStream<string>({
      write(chunk) {
        return Promise.resolve();
      },
    });
    
    const stdinWriter = stdin.getWriter();
    
    const streams: ProcessStreams = { 
      stdin, 
      stdout: stdoutPair.writable, 
      stderr: stderrPair.writable 
    };
    
    // Read from stdout and stderr streams
    const stdoutReader = stdoutPair.readable.getReader();
    const stderrReader = stderrPair.readable.getReader();
    
    const readStdout = async () => {
      try {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          this.outputEmitter.emit(value);
        }
      } catch (e) {
        // Stream closed
      } finally {
        stdoutReader.releaseLock();
      }
    };
    
    const readStderr = async () => {
      try {
        while (true) {
          const { done, value } = await stderrReader.read();
          if (done) break;
          this.errorEmitter.emit(`\x1b[31m${value}\x1b[0m`); // Red for stderr
        }
      } catch (e) {
        // Stream closed
      } finally {
        stderrReader.releaseLock();
      }
    };
    
    // Start reading from streams
    Promise.all([readStdout(), readStderr()]);
    
    try {
      const exitCode = await handler.execute(args, streams, this.cwd, this.getEnv());
      
      // Close streams
      stdoutPair.writable.close();
      stderrPair.writable.close();
      
      if (exitCode !== 0) {
        // Error already written to stderr
      }
    } catch (error: any) {
      this.errorEmitter.emit(`Error: ${error.message}\n`);
      stdoutPair.writable.close();
      stderrPair.writable.close();
    } finally {
      stdinWriter.releaseLock();
    }
  }
}

