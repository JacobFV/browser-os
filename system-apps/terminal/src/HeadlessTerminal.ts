import { 
  executeCommand, 
  getCommand, 
  getAllCommands, 
  createPairedStreams,
  getProcess,
  spawnApp
} from '@browser-os/process';
import type { ProcessStreams } from '@browser-os/process';
import { vfs } from '@browser-os/fs';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ParsedCommandLine {
  commands: Array<{ command: string; args: string[] }>;
  background: boolean;
  stdoutRedirect?: { file: string; append: boolean };
  stdinRedirect?: string;
}

export class HeadlessTerminal {
  private cwd: string = 'vfs://documents/';
  private env: Record<string, string> = {};
  private shellPid: string | null = null;
  private history: string[] = [];
  private aliases: Map<string, string> = new Map();

  constructor(initialCwd?: string, initialEnv?: Record<string, string>) {
    if (initialCwd) {
      this.cwd = initialCwd;
    }
    if (initialEnv) {
      this.env = { ...initialEnv };
    }
    // Create a shell process to track cwd and env
    this.shellPid = spawnApp('terminal-shell');
    const shellProc = getProcess(this.shellPid);
    if (shellProc) {
      shellProc.cwd = this.cwd;
      shellProc.env = { ...this.env };
    }
  }

  getCwd(): string {
    return this.cwd;
  }

  getEnv(): Record<string, string> {
    return { ...this.env };
  }

  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Expand environment variables in a string
   * Supports $VAR and ${VAR} syntax
   */
  private expandEnvVars(text: string, env: Record<string, string>): string {
    return text.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, braced, simple) => {
      const varName = braced || simple;
      return env[varName] || '';
    });
  }

  /**
   * Parse command line for pipes, redirections, and background execution
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
   * Execute command substitution: $(command) or `command`
   */
  private async executeCommandSubstitution(command: string, env: Record<string, string>): Promise<string> {
    // Handle $(command) syntax
    const dollarSubst = command.match(/\$\(([^)]+)\)/);
    if (dollarSubst) {
      const subCommand = dollarSubst[1];
      const result = await this.executeSingleCommandLine(subCommand);
      return result.stdout.trim();
    }
    
    // Handle `command` syntax
    const backtickSubst = command.match(/`([^`]+)`/);
    if (backtickSubst) {
      const subCommand = backtickSubst[1];
      const result = await this.executeSingleCommandLine(subCommand);
      return result.stdout.trim();
    }
    
    return command;
  }

  /**
   * Expand command substitution in a string
   */
  private async expandCommandSubstitution(text: string, env: Record<string, string>): Promise<string> {
    // Expand $(command) substitutions
    const dollarPattern = /\$\(([^)]+)\)/g;
    let result = text;
    const dollarMatches = [...text.matchAll(dollarPattern)];
    for (const match of dollarMatches) {
      const subResult = await this.executeCommandSubstitution(match[0], env);
      result = result.replace(match[0], subResult);
    }
    
    // Expand `command` substitutions
    const backtickPattern = /`([^`]+)`/g;
    const backtickMatches = [...result.matchAll(backtickPattern)];
    for (const match of backtickMatches) {
      const subResult = await this.executeCommandSubstitution(match[0], env);
      result = result.replace(match[0], subResult);
    }
    
    return result;
  }

  /**
   * Execute a command line and return the result
   * Supports command chaining with &&, ||, and ;
   */
  async execute(commandLine: string): Promise<ExecutionResult> {
    // Add to history
    if (commandLine.trim()) {
      this.history.push(commandLine);
    }

    // Split by ; first, then handle && and ||
    const parts = this.splitCommandChain(commandLine);
    let lastResult: ExecutionResult = { stdout: '', stderr: '', exitCode: 0 };
    let accumulatedStdout = '';
    let accumulatedStderr = '';
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // Handle && and ||
      if (trimmed.includes('&&') || trimmed.includes('||')) {
        const chainParts = this.splitLogicalChain(trimmed);
        for (const chainPart of chainParts) {
          const { command, operator } = chainPart;
          const result = await this.executeSingleCommandLine(command);
          lastResult = result;
          accumulatedStdout += result.stdout;
          accumulatedStderr += result.stderr;
          
          if (operator === '&&' && result.exitCode !== 0) {
            // Stop on first failure
            break;
          } else if (operator === '||' && result.exitCode === 0) {
            // Stop on first success
            break;
          }
        }
      } else {
        lastResult = await this.executeSingleCommandLine(trimmed);
        accumulatedStdout += lastResult.stdout;
        accumulatedStderr += lastResult.stderr;
      }
    }
    
    return { 
      stdout: accumulatedStdout, 
      stderr: accumulatedStderr, 
      exitCode: lastResult.exitCode 
    };
  }

  /**
   * Split command line by semicolons
   */
  private splitCommandChain(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
        current += char;
      } else if (char === ';' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    return parts;
  }

  /**
   * Split command line by && and ||
   */
  private splitLogicalChain(line: string): Array<{ command: string; operator?: '&&' | '||' }> {
    const parts: Array<{ command: string; operator?: '&&' | '||' }> = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
        current += char;
      } else if (!inQuotes && char === '&' && nextChar === '&') {
        parts.push({ command: current.trim(), operator: '&&' });
        current = '';
        i++; // Skip next &
      } else if (!inQuotes && char === '|' && nextChar === '|') {
        parts.push({ command: current.trim(), operator: '||' });
        current = '';
        i++; // Skip next |
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      parts.push({ command: current.trim() });
    }
    
    return parts;
  }

  /**
   * Execute a single command line (without chaining)
   */
  private async executeSingleCommandLine(commandLine: string): Promise<ExecutionResult> {
    // Expand command substitution first
    let env: Record<string, string> = {};
    if (this.shellPid) {
      const shellProc = getProcess(this.shellPid);
      if (shellProc?.env) {
        env = { ...shellProc.env };
      }
    }
    
    let expandedLine = await this.expandCommandSubstitution(commandLine, env);
    
    const parsed = this.parseCommandLine(expandedLine);
    
    // Expand environment variables in commands and args
    parsed.commands = parsed.commands.map(cmd => ({
      command: this.expandEnvVars(cmd.command, env),
      args: cmd.args.map(arg => this.expandEnvVars(arg, env)),
    }));
    
    if (parsed.stdoutRedirect) {
      parsed.stdoutRedirect.file = this.expandEnvVars(parsed.stdoutRedirect.file, env);
    }
    if (parsed.stdinRedirect) {
      parsed.stdinRedirect = this.expandEnvVars(parsed.stdinRedirect, env);
    }
    
    // Handle empty command
    if (parsed.commands.length === 0) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    
    // Handle single command with no pipes
    if (parsed.commands.length === 1 && !parsed.stdinRedirect && !parsed.background) {
      const { command, args } = parsed.commands[0];
      
      // Handle built-in shell commands
      if (command === 'cd') {
        return await this.handleCd(args);
      }

      if (command === 'export') {
        return await this.handleExport(args);
      }

      if (command === 'alias') {
        // Join args back together to handle quoted values like ll="ls -l"
        const aliasArg = args.join(' ');
        return await this.handleAlias([aliasArg]);
      }

      if (command === 'history') {
        return await this.handleHistory(args);
      }

      if (command === 'env') {
        return await this.handleEnv();
      }

      if (command === 'which') {
        return await this.handleWhich(args);
      }

      // If there's output redirection, handle it specially
      if (parsed.stdoutRedirect) {
        const result = await this.executeSingleCommand(command, args);
        
        // Get cwd from shell process if available
        let commandCwd = this.cwd;
        if (this.shellPid) {
          const shellProc = getProcess(this.shellPid);
          if (shellProc?.cwd) {
            commandCwd = shellProc.cwd;
          }
        }
        
        // Write output to file
        const filePath = parsed.stdoutRedirect.file.startsWith('vfs://')
          ? parsed.stdoutRedirect.file
          : commandCwd.endsWith('/')
            ? commandCwd + parsed.stdoutRedirect.file
            : commandCwd + '/' + parsed.stdoutRedirect.file;
        
        try {
          if (parsed.stdoutRedirect.append) {
            const existing = await vfs.read(filePath, { binary: false }).catch(() => '') as string;
            await vfs.write(filePath, existing + result.stdout);
          } else {
            await vfs.write(filePath, result.stdout);
          }
          return { stdout: '', stderr: result.stderr, exitCode: result.exitCode };
        } catch (error: any) {
          return { stdout: '', stderr: `Error writing to file: ${error.message}\n`, exitCode: 1 };
        }
      }

      // Execute single command
      return await this.executeSingleCommand(command, args);
    }
    
    // Handle pipes or redirections
    return await this.executePipedCommands(parsed);
  }

  private async handleCd(args: string[]): Promise<ExecutionResult> {
    if (args.length === 0) {
      return { stdout: this.cwd + '\n', stderr: '', exitCode: 0 };
    }
    const targetPath = args[0].startsWith('vfs://')
      ? args[0]
      : this.cwd.endsWith('/')
        ? this.cwd + args[0]
        : this.cwd + '/' + args[0];
    
    try {
      const stat = await vfs.stat(targetPath);
      if (stat.type === 'directory') {
        const newDir = targetPath.endsWith('/') ? targetPath : targetPath + '/';
        this.cwd = newDir;
        // Update shell process cwd
        if (this.shellPid) {
          const shellProc = getProcess(this.shellPid);
          if (shellProc) {
            shellProc.cwd = newDir;
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      } else {
        return { stdout: '', stderr: `cd: ${args[0]}: Not a directory\n`, exitCode: 1 };
      }
    } catch (error: any) {
      return { stdout: '', stderr: `cd: ${args[0]}: ${error.message}\n`, exitCode: 1 };
    }
  }

  private async handleExport(args: string[]): Promise<ExecutionResult> {
    if (args.length === 0) {
      // Show all environment variables
      const envStr = Object.entries(this.env)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') + '\n';
      return { stdout: envStr, stderr: '', exitCode: 0 };
    }

    for (const arg of args) {
      const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        this.env[key] = value;
        if (this.shellPid) {
          const shellProc = getProcess(this.shellPid);
          if (shellProc) {
            shellProc.env = { ...this.env };
          }
        }
      } else {
        return { stdout: '', stderr: `export: invalid syntax: ${arg}\n`, exitCode: 1 };
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private async handleAlias(args: string[]): Promise<ExecutionResult> {
    if (args.length === 0) {
      // Show all aliases
      const aliasStr = Array.from(this.aliases.entries())
        .map(([k, v]) => `${k}='${v}'`)
        .join('\n') + '\n';
      return { stdout: aliasStr, stderr: '', exitCode: 0 };
    }

    for (const arg of args) {
      // Handle both ll="ls -l" and ll='ls -l' formats
      // Match: name="value" or name='value' or name=value
      const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(?:"([^"]*)"|'([^']*)'|(.+))$/);
      if (match) {
        const [, name, doubleQuoted, singleQuoted, unquoted] = match;
        const value = doubleQuoted || singleQuoted || unquoted || '';
        this.aliases.set(name, value);
      } else {
        return { stdout: '', stderr: `alias: invalid syntax: ${arg}\n`, exitCode: 1 };
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private async handleHistory(args: string[]): Promise<ExecutionResult> {
    const limit = args.length > 0 ? parseInt(args[0]) : this.history.length;
    const historyStr = this.history.slice(-limit)
      .map((cmd, idx) => `${this.history.length - limit + idx + 1}  ${cmd}`)
      .join('\n') + '\n';
    return { stdout: historyStr, stderr: '', exitCode: 0 };
  }

  private async handleEnv(): Promise<ExecutionResult> {
    const envStr = Object.entries(this.env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n';
    return { stdout: envStr, stderr: '', exitCode: 0 };
  }

  private async handleWhich(args: string[]): Promise<ExecutionResult> {
    if (args.length === 0) {
      return { stdout: '', stderr: 'which: missing command name\n', exitCode: 1 };
    }

    const command = args[0];
    
    // Check aliases first
    if (this.aliases.has(command)) {
      return { stdout: `${command}: aliased to ${this.aliases.get(command)}\n`, stderr: '', exitCode: 0 };
    }

    // Check built-in commands
    const allCommands = getAllCommands();
    const found = allCommands.find(cmd => cmd.name === command);
    if (found) {
      return { stdout: `${command}\n`, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `which: ${command}: not found\n`, exitCode: 1 };
  }

  private async executeSingleCommand(command: string, args: string[]): Promise<ExecutionResult> {
    // Check for aliases
    if (this.aliases.has(command)) {
      const aliasValue = this.aliases.get(command)!;
      return await this.execute(aliasValue + ' ' + args.join(' '));
    }

    const handler = getCommand(command);
    if (!handler) {
      return { 
        stdout: '', 
        stderr: `Command not found: ${command}\nType "help" for available commands.\n`, 
        exitCode: 127 
      };
    }

    // Create paired streams
    const stdoutPair = createPairedStreams();
    const stderrPair = createPairedStreams();
    
    const stdin = new WritableStream<string>({
      write(chunk) {
        return Promise.resolve();
      },
    });

    const streams: ProcessStreams = { 
      stdin, 
      stdout: stdoutPair.writable, 
      stderr: stderrPair.writable 
    };

    // Read from stdout and stderr streams
    const stdoutReader = stdoutPair.readable.getReader();
    const stderrReader = stderrPair.readable.getReader();
    
    let stdout = '';
    let stderr = '';
    
    const readStdout = async () => {
      try {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          stdout += value;
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
          stderr += value;
        }
      } catch (e) {
        // Stream closed
      } finally {
        stderrReader.releaseLock();
      }
    };

    // Start reading from streams
    const readPromises = Promise.all([readStdout(), readStderr()]);

    // Get cwd from shell process if available
    let commandCwd = this.cwd;
    if (this.shellPid) {
      const shellProc = getProcess(this.shellPid);
      if (shellProc?.cwd) {
        commandCwd = shellProc.cwd;
      }
    }
    
    try {
      // Get environment variables from shell process
      let env: Record<string, string> = {};
      if (this.shellPid) {
        const shellProc = getProcess(this.shellPid);
        if (shellProc?.env) {
          env = { ...shellProc.env };
        }
      }
      
      // Execute command
      const exitCode = await handler.execute(args, streams, commandCwd, env);
      
      // Close streams
      stdoutPair.writable.close();
      stderrPair.writable.close();
      stdin.getWriter().close();
      
      // Wait for readers to finish
      await readPromises;
      
      return { stdout, stderr, exitCode };
    } catch (error: any) {
      stdoutPair.writable.abort(error);
      stderrPair.writable.abort(error);
      await readPromises;
      return { stdout, stderr: `Error: ${error.message}\n`, exitCode: 1 };
    }
  }
  
  private async executePipedCommands(parsed: ParsedCommandLine): Promise<ExecutionResult> {
    // Get cwd from shell process if available
    let commandCwd = this.cwd;
    if (this.shellPid) {
      const shellProc = getProcess(this.shellPid);
      if (shellProc?.cwd) {
        commandCwd = shellProc.cwd;
      }
    }
    
    // Handle stdin redirection - create a readable stream from file
    let stdinSource: ReadableStream<string> | undefined;
    if (parsed.stdinRedirect) {
      try {
        const filePath = parsed.stdinRedirect.startsWith('vfs://')
          ? parsed.stdinRedirect
          : commandCwd.endsWith('/')
            ? commandCwd + parsed.stdinRedirect
            : commandCwd + '/' + parsed.stdinRedirect;
        const content = await vfs.read(filePath, { binary: false }) as string;
        stdinSource = new ReadableStream({
          start(controller) {
            controller.enqueue(content);
            controller.close();
          },
        });
      } catch (error: any) {
        return { stdout: '', stderr: `Error reading file: ${parsed.stdinRedirect}: ${error.message}\n`, exitCode: 1 };
      }
    }
    
    // Execute commands in pipe chain
    let previousStdout: ReadableStream<string> | undefined = stdinSource;
    const commandPromises: Promise<number>[] = [];
    let finalStdout = '';
    let finalStderr = '';
    
    for (let i = 0; i < parsed.commands.length; i++) {
      const { command, args } = parsed.commands[i];
      const isLast = i === parsed.commands.length - 1;
      
      const handler = getCommand(command);
      if (!handler) {
        return { stdout: '', stderr: `Command not found: ${command}\n`, exitCode: 127 };
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
            while (true) {
              const { done, value } = await stdoutReader.read();
              if (done) break;
              finalStdout += value;
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
              finalStderr += value;
            }
          } catch (e) {
            // Stream closed
          } finally {
              stderrReader.releaseLock();
            }
          };
        
        Promise.all([readStdout(), readStderr()]);
      }
      
      // Get environment variables from shell process
      let env: Record<string, string> = {};
      if (this.shellPid) {
        const shellProc = getProcess(this.shellPid);
        if (shellProc?.env) {
          env = { ...shellProc.env };
        }
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
    
    // Handle output redirection
    if (parsed.stdoutRedirect) {
      const filePath = parsed.stdoutRedirect.file.startsWith('vfs://')
        ? parsed.stdoutRedirect.file
        : commandCwd.endsWith('/')
          ? commandCwd + parsed.stdoutRedirect.file
          : commandCwd + '/' + parsed.stdoutRedirect.file;
      
      try {
        if (parsed.stdoutRedirect.append) {
          const existing = await vfs.read(filePath, { binary: false }).catch(() => '') as string;
          await vfs.write(filePath, existing + finalStdout);
        } else {
          await vfs.write(filePath, finalStdout);
        }
        finalStdout = ''; // Don't return stdout if redirected
      } catch (error: any) {
        finalStderr += `Error writing to file: ${error.message}\n`;
      }
    }
    
    // Get exit code from last command
    const exitCodes = await Promise.all(commandPromises);
    const exitCode = exitCodes[exitCodes.length - 1] || 0;
    
    return { stdout: finalStdout, stderr: finalStderr, exitCode };
  }
}

