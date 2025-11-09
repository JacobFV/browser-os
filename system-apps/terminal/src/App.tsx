import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { processManager, executeCommand, getCommand } from '@browser-os/process';
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

  useEffect(() => {
    if (!terminalRef.current) return;

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
        // Tab completion (basic)
        const parts = currentCommandRef.current.trim().split(' ');
        if (parts.length === 1) {
          const cmd = parts[0];
          const commands = processManager.getAllCommands().map(c => c.name);
          const matches = commands.filter(c => c.startsWith(cmd));
          if (matches.length === 1) {
            const completion = matches[0].slice(cmd.length);
            currentCommandRef.current += completion;
            xterm.write(completion);
          }
        }
      } else {
        // Regular character
        currentCommandRef.current += data;
        xterm.write(data);
      }
    };

    xterm.onData(handleInput);
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

  const executeCommandLine = async (line: string, xterm: XTerm) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 0) return;

    const command = parts[0];
    const args = parts.slice(1);

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
          setCurrentDir(targetPath.endsWith('/') ? targetPath : targetPath + '/');
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
      const commands = processManager.getAllCommands();
      commands.forEach(cmd => {
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

    // Execute via process manager
    try {
      const handler = getCommand(command);
      if (!handler) {
        xterm.writeln(`Command not found: ${command}`);
        xterm.writeln(`Type "help" for available commands.`);
        return;
      }

      // Create streams for this command execution
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];
      
      const stdout = new ReadableStream<string>({
        start(controller) {
          // Will be written to by command
        },
      });

      const stderr = new ReadableStream<string>({
        start(controller) {
          // Will be written to by command
        },
      });

      const stdin = new WritableStream<string>({
        write(chunk) {
          // Handle stdin if needed
        },
      });

      // Create a wrapper that writes to xterm
      const streams = {
        stdin,
        stdout: {
          getWriter: () => {
            let buffer = '';
            return {
              write: async (chunk: string) => {
                buffer += chunk;
                // Write immediately to xterm
                xterm.write(chunk);
              },
              releaseLock: () => {},
            };
          },
        } as any,
        stderr: {
          getWriter: () => {
            return {
              write: async (chunk: string) => {
                xterm.write(`\x1b[31m${chunk}\x1b[0m`); // Red for stderr
              },
              releaseLock: () => {},
            };
          },
        } as any,
      };

      const exitCode = await handler.execute(args, streams, currentDir, {});
      
      if (exitCode !== 0) {
        // Error already written to stderr
      }
    } catch (error: any) {
      xterm.writeln(`Error: ${error.message}`);
    }
  };

  return (
    <div className="terminal-app">
      <div ref={terminalRef} className="terminal-container" />
    </div>
  );
};
