import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { spawnApp, getProcess, executeCommand, getCommand, getAllCommands, createPairedStreams, ProcessStreams } from '@browser-os/process';
import { vfs } from '@browser-os/fs';
import './Terminal.css';

export const TerminalApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentDir, setCurrentDir] = useState<string>('vfs://documents/');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const currentCommandRef = useRef<string>('');
  const shellPidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create a shell process to track cwd
    shellPidRef.current = spawnApp('terminal-shell');
    const shellProc = getProcess(shellPidRef.current);
    if (shellProc) {
      shellProc.cwd = currentDir;
    }

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff00',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Print welcome message
    xterm.writeln('browser-os Terminal v1.0');
    xterm.writeln('Type "help" for available commands.');
    xterm.writeln('');

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Command execution handler
    const handleInput = async (data: string) => {
      // Check if there's an active stdin writer (interactive command)
      const stdinWriter = (xterm as any).stdinWriter;
      if (stdinWriter) {
        // Send input to active command
        try {
          await stdinWriter.write(data);
          return;
        } catch (e) {
          // Command finished, clear writer
          (xterm as any).stdinWriter = null;
        }
      }
      
      if (data === '\r' || data === '\n') {
        // Enter pressed
        xterm.writeln('');
        const command = currentCommandRef.current.trim();
        
        if (command) {
          setHistory(prev => [...prev, command]);
          setHistoryIndex(-1);
          
          await executeCommandLine(command, xterm);
        }
        
        prompt(xterm);
        currentCommandRef.current = '';
      } else if (data === '\x7f' || data === '\b') {
        // Backspace
        if (currentCommandRef.current.length > 0) {
          currentCommandRef.current = currentCommandRef.current.slice(0, -1);
          xterm.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        // Up arrow - history
        if (history.length > 0) {
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          const histCommand = history[newIndex];
          // Clear current line and write history command
          xterm.write('\r\x1b[K');
          currentCommandRef.current = histCommand;
          xterm.write(histCommand);
        }
      } else if (data === '\x1b[B') {
        // Down arrow - history
        if (historyIndex >= 0) {
          const newIndex = historyIndex + 1;
          if (newIndex < history.length) {
            setHistoryIndex(newIndex);
            const histCommand = history[newIndex];
            xterm.write('\r\x1b[K');
            currentCommandRef.current = histCommand;
            xterm.write(histCommand);
          } else {
            setHistoryIndex(-1);
            xterm.write('\r\x1b[K');
            currentCommandRef.current = '';
          }
        }
      } else if (data === '\t') {
        // Tab completion - support command names and file paths
        const parts = currentCommandRef.current.trim().split(/\s+/);
        const lastPart = parts[parts.length - 1] || '';
        
        if (parts.length === 1) {
          // Complete command name
          const cmd = lastPart;
          const commands = getAllCommands().map((c: { name: string }) => c.name);
          const matches = commands.filter((c: string) => c.startsWith(cmd));
          if (matches.length === 1) {
            const completion = matches[0].slice(cmd.length);
            currentCommandRef.current += completion;
            xterm.write(completion);
          } else if (matches.length > 1) {
            // Show all matches
            xterm.writeln('');
            matches.forEach((m: string) => xterm.writeln(m));
            prompt(xterm);
            xterm.write(currentCommandRef.current);
          }
        } else {
          // Complete file path
          const pathToComplete = lastPart;
          const basePath = pathToComplete.startsWith('vfs://')
            ? pathToComplete
            : currentDir.endsWith('/')
              ? currentDir + pathToComplete
              : currentDir + '/' + pathToComplete;
          
          try {
            // Get directory and prefix
            const lastSlash = basePath.lastIndexOf('/');
            const dirPath = lastSlash >= 0 ? basePath.slice(0, lastSlash + 1) : basePath;
            const prefix = lastSlash >= 0 ? basePath.slice(lastSlash + 1) : basePath;
            
            const entries = await vfs.readdir(dirPath || currentDir);
            const matches = entries
              .filter((e: { name: string }) => e.name.startsWith(prefix))
              .map((e: { name: string }) => e.name);
            
            if (matches.length === 1) {
              const completion = matches[0].slice(prefix.length);
              const isDir = entries.find((e: { name: string; stat: { type: string } }) => e.name === matches[0])?.stat.type === 'directory';
              currentCommandRef.current += completion + (isDir ? '/' : '');
              xterm.write(completion + (isDir ? '/' : ''));
            } else if (matches.length > 1) {
              // Show all matches
              xterm.writeln('');
              matches.forEach((m: string) => {
                const entry = entries.find((e: { name: string; stat: { type: string } }) => e.name === m);
                const suffix = entry?.stat.type === 'directory' ? '/' : '';
                xterm.writeln(m + suffix);
              });
              prompt(xterm);
              xterm.write(currentCommandRef.current);
            }
          } catch (error) {
            // Path doesn't exist or error reading
          }
        }
      } else {
        // Regular character
        currentCommandRef.current += data;
        xterm.write(data);
      }
    };

    xterm.onData(handleInput);
    
    // Store xterm reference for stdin input
    (xterm as any).stdinWriter = null;
    
    prompt(xterm);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, [currentDir, history, historyIndex]);

  const prompt = (xterm: XTerm) => {
    const dirName = currentDir.split('/').filter(Boolean).pop() || '/';
    xterm.write(`\x1b[32muser@browser-os\x1b[0m:\x1b[34m${dirName}\x1b[0m$ `);
  };

  /**
   * Expand environment variables in a string
   * Supports $VAR and ${VAR} syntax
   */
  const expandEnvVars = (text: string, env: Record<string, string>): string => {
    return text.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, braced, simple) => {
      const varName = braced || simple;
      return env[varName] || '';
    });
  };
  
  /**
   * Parse command line for pipes, redirections, and background execution
   */
  const parseCommandLine = (line: string): {
    commands: Array<{ command: string; args: string[] }>;
    background: boolean;
    stdoutRedirect?: { file: string; append: boolean };
    stdinRedirect?: string;
  } => {
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
  };

  const executeCommandLine = async (line: string, xterm: XTerm) => {
    const parsed = parseCommandLine(line);
    
    // Get environment variables from shell process
    let env: Record<string, string> = {};
    if (shellPidRef.current) {
      const shellProc = getProcess(shellPidRef.current);
      if (shellProc?.env) {
        env = { ...shellProc.env };
      }
    }
    
    // Expand environment variables in commands and args
    parsed.commands = parsed.commands.map(cmd => ({
      command: expandEnvVars(cmd.command, env),
      args: cmd.args.map(arg => expandEnvVars(arg, env)),
    }));
    
    if (parsed.stdoutRedirect) {
      parsed.stdoutRedirect.file = expandEnvVars(parsed.stdoutRedirect.file, env);
    }
    if (parsed.stdinRedirect) {
      parsed.stdinRedirect = expandEnvVars(parsed.stdinRedirect, env);
    }
    
    // Handle empty command
    if (parsed.commands.length === 0) return;
    
    // Handle single command with no pipes
    if (parsed.commands.length === 1 && !parsed.stdoutRedirect && !parsed.stdinRedirect && !parsed.background) {
      const { command, args } = parsed.commands[0];
      
      // Handle built-in shell commands
      if (command === 'cd') {
        if (args.length === 0) {
          xterm.writeln(currentDir);
          return;
        }
        const targetPath = args[0].startsWith('vfs://')
          ? args[0]
          : currentDir.endsWith('/')
            ? currentDir + args[0]
            : currentDir + '/' + args[0];
        
        try {
          const stat = await vfs.stat(targetPath);
          if (stat.type === 'directory') {
            const newDir = targetPath.endsWith('/') ? targetPath : targetPath + '/';
            setCurrentDir(newDir);
            // Update shell process cwd
            if (shellPidRef.current) {
              const shellProc = getProcess(shellPidRef.current);
              if (shellProc) {
                shellProc.cwd = newDir;
              }
            }
          } else {
            xterm.writeln(`cd: ${args[0]}: Not a directory`);
          }
        } catch (error: any) {
          xterm.writeln(`cd: ${args[0]}: ${error.message}`);
        }
        return;
      }

      if (command === 'help') {
        xterm.writeln('Available commands:');
        const commands = getAllCommands();
        commands.forEach((cmd: { name: string; description?: string }) => {
          xterm.writeln(`  ${cmd.name.padEnd(12)} - ${cmd.description || ''}`);
        });
        xterm.writeln('  cd <dir>      - Change directory');
        xterm.writeln('  help          - Show this help');
        xterm.writeln('  exit          - Exit terminal');
        return;
      }

      if (command === 'exit') {
        xterm.writeln('Goodbye!');
        // Close window would be handled by parent
        return;
      }

      // Execute single command (existing logic)
      await executeSingleCommand(command, args, xterm);
      return;
    }
    
    // Handle pipes or redirections
    await executePipedCommands(parsed, xterm);
  };
  
  const executeSingleCommand = async (command: string, args: string[], xterm: XTerm) => {
    const handler = getCommand(command);
    if (!handler) {
      xterm.writeln(`Command not found: ${command}`);
      xterm.writeln(`Type "help" for available commands.`);
      return;
    }

    // Create paired streams - commands write to writable, terminal reads from readable
    const stdoutPair = createPairedStreams();
    const stderrPair = createPairedStreams();
    
    const stdin = new WritableStream<string>({
      write(chunk) {
        // Handle stdin if needed - will be connected to terminal input
        return Promise.resolve();
      },
    });
    
    // Store stdin writer for interactive commands
    const stdinWriter = stdin.getWriter();
    (xterm as any).stdinWriter = stdinWriter;
    
    // Clear stdin writer when command completes
    const originalClose = stdinWriter.close.bind(stdinWriter);
    stdinWriter.close = async () => {
      (xterm as any).stdinWriter = null;
      await originalClose();
    };

    const streams: ProcessStreams = { 
      stdin, 
      stdout: stdoutPair.writable, 
      stderr: stderrPair.writable 
    };

    // Read from stdout and stderr streams and write to xterm
    const stdoutReader = stdoutPair.readable.getReader();
    const stderrReader = stderrPair.readable.getReader();
    
    const readStdout = async () => {
      try {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          xterm.write(value);
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
          xterm.write(`\x1b[31m${value}\x1b[0m`); // Red for stderr
        }
      } catch (e) {
        // Stream closed
      } finally {
        stderrReader.releaseLock();
      }
    };

    // Start reading from streams
    Promise.all([readStdout(), readStderr()]);

    // Get cwd from shell process if available, otherwise use currentDir state
    let commandCwd = currentDir;
    if (shellPidRef.current) {
      const shellProc = getProcess(shellPidRef.current);
      if (shellProc?.cwd) {
        commandCwd = shellProc.cwd;
      }
    }
    
    try {
      // Get environment variables from shell process
      let env: Record<string, string> = {};
      if (shellPidRef.current) {
        const shellProc = getProcess(shellPidRef.current);
        if (shellProc?.env) {
          env = { ...shellProc.env };
        }
      }
      
      // Execute command with shell process cwd and env
      const exitCode = await handler.execute(args, streams, commandCwd, env);
      
      // Close streams
      stdoutPair.writable.close();
      stderrPair.writable.close();
      
      if (exitCode !== 0) {
        // Error already written to stderr
      }
    } catch (error: any) {
      xterm.writeln(`Error: ${error.message}`);
      stdoutPair.writable.close();
      stderrPair.writable.close();
    }
  };
  
  const executePipedCommands = async (
    parsed: {
      commands: Array<{ command: string; args: string[] }>;
      background: boolean;
      stdoutRedirect?: { file: string; append: boolean };
      stdinRedirect?: string;
    },
    xterm: XTerm
  ) => {
    // Get cwd from shell process if available
    let commandCwd = currentDir;
    if (shellPidRef.current) {
      const shellProc = getProcess(shellPidRef.current);
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
        xterm.writeln(`Error reading file: ${parsed.stdinRedirect}: ${error.message}`);
        return;
      }
    }
    
    // Execute commands in pipe chain
    let previousStdout: ReadableStream<string> | undefined = stdinSource;
    const commandPromises: Promise<number>[] = [];
    
    for (let i = 0; i < parsed.commands.length; i++) {
      const { command, args } = parsed.commands[i];
      const isLast = i === parsed.commands.length - 1;
      
      const handler = getCommand(command);
      if (!handler) {
        xterm.writeln(`Command not found: ${command}`);
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
                  const existing = await vfs.read(filePath, { binary: false }).catch(() => '') as string;
                  await vfs.write(filePath, existing + output);
                } else {
                  await vfs.write(filePath, output);
                }
              } catch (error: any) {
                xterm.writeln(`Error writing to file: ${error.message}`);
              }
            } else {
              xterm.write(output);
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
              xterm.write(`\x1b[31m${value}\x1b[0m`); // Red for stderr
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
      if (shellPidRef.current) {
        const shellProc = getProcess(shellPidRef.current);
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
  };

  return (
    <div className="terminal-app">
      <div ref={terminalRef} className="terminal-container" />
    </div>
  );
};
