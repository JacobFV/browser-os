import React, { useState, useRef, useEffect } from 'react';
import { Terminal as XTermTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { EventBus } from '@browser-os/events';
import { TerminalContextProvider, useTerminalContext } from './TerminalContext';
import { CommandRegistry } from './commands/CommandRegistry';
import { parseCommand } from './utils/commandParser';
import './Terminal.css';

export interface TerminalProps {
  windowId: string;
  eventBus?: EventBus;
}

const TerminalInner: React.FC<{ windowId: string }> = ({ windowId }) => {
  const context = useTerminalContext();
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandRegistryRef = useRef<CommandRegistry>(new CommandRegistry());
  const isExecutingRef = useRef(false);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const getPrompt = () => {
    const dirName = context.cwd === context.homeDir ? '~' : context.cwd.split('/').pop() || '/';
    return `user@browser-os:${dirName}$ `;
  };

  const writePrompt = () => {
    if (xtermRef.current) {
      xtermRef.current.write(`\r\n${getPrompt()}`);
    }
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      writePrompt();
      return;
    }

    if (!xtermRef.current) return;

    // Handle aliases
    const processedCmd = commandRegistryRef.current.resolveAliases(cmd.trim());

    // Add command to history
    const newHistory = [...commandHistoryRef.current, cmd];
    commandHistoryRef.current = newHistory;
    historyIndexRef.current = newHistory.length;
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);
    setCurrentInput('');

    if (!context.isInitialized) {
      xtermRef.current.write('Error: Filesystem not initialized. Please wait...\r\n');
      writePrompt();
      return;
    }

    // Handle clear command specially
    if (processedCmd.trim() === 'clear') {
      xtermRef.current.clear();
      writePrompt();
      return;
    }

    isExecutingRef.current = true;

    // Parse command
    const parsedCommand = parseCommand(processedCmd);

    // Execute command
    const result = await commandRegistryRef.current.executeCommand(parsedCommand, {
      fs: context.fs,
      cwd: context.cwd,
      env: context.env,
      eventBus: context.eventBus,
      setCwd: context.setCwd,
      setEnv: context.setEnv,
      commandHistory: newHistory,
      homeDir: context.homeDir,
    });

    isExecutingRef.current = false;

    if (result.length > 0) {
      const resultLines = Array.isArray(result) ? result : [result];
      resultLines.forEach((line) => {
        xtermRef.current?.write(`${line}\r\n`);
      });
    }

    writePrompt();
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new XTermTerminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
      },
      fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace",
      fontSize: 14,
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    term.open(terminalRef.current);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Write welcome message
    term.write('Terminal v0.2.0\r\n');
    term.write('Type "help" for available commands.\r\n');
    writePrompt();

    // Handle input
    let inputBuffer = '';

    term.onData((data) => {
      if (isExecutingRef.current) return;

      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        // Enter - write newline and execute command
        const cmd = inputBuffer.trim();
        term.write('\r\n');
        inputBuffer = '';
        setCurrentInput('');
        executeCommand(cmd);
        return;
      }

      // Handle Backspace
      if (code === 127 || code === 8) {
        // Backspace (127 on Unix, 8 on Windows)
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          setCurrentInput(inputBuffer);
          term.write('\b \b');
        }
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        // Ctrl+C
        inputBuffer = '';
        setCurrentInput('');
        term.write('^C\r\n');
        writePrompt();
        return;
      }

      // Handle Arrow keys (ESC sequences)
      if (data.startsWith('\x1b[')) {
        if (data === '\x1b[A') {
          // Arrow Up
          if (historyIndexRef.current > 0) {
            const prompt = getPrompt();
            const oldLineLength = prompt.length + inputBuffer.length;
            const newIndex = historyIndexRef.current - 1;
            historyIndexRef.current = newIndex;
            setHistoryIndex(newIndex);
            const historyCmd = commandHistoryRef.current[newIndex];
            inputBuffer = historyCmd;
            setCurrentInput(historyCmd);
            // Clear current line and rewrite with history
            const newLineLength = prompt.length + historyCmd.length;
            term.write('\r' + ' '.repeat(Math.max(oldLineLength, newLineLength)) + '\r' + prompt + historyCmd);
          }
          return;
        } else if (data === '\x1b[B') {
          // Arrow Down
          const prompt = getPrompt();
          const currentLineLength = prompt.length + inputBuffer.length;
          if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
            const newIndex = historyIndexRef.current + 1;
            historyIndexRef.current = newIndex;
            setHistoryIndex(newIndex);
            const historyCmd = commandHistoryRef.current[newIndex];
            inputBuffer = historyCmd;
            setCurrentInput(historyCmd);
            term.write('\r' + ' '.repeat(Math.max(currentLineLength, prompt.length + historyCmd.length)) + '\r' + prompt + historyCmd);
          } else {
            historyIndexRef.current = commandHistoryRef.current.length;
            setHistoryIndex(commandHistoryRef.current.length);
            inputBuffer = '';
            setCurrentInput('');
            term.write('\r' + ' '.repeat(currentLineLength) + '\r' + prompt);
          }
          return;
        }
      }

      // Handle regular character input
      if (code >= 32 && code <= 126) {
        // Printable characters
        inputBuffer += data;
        setCurrentInput(inputBuffer);
        term.write(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);


  return <div className="terminal" ref={terminalRef} />;
};

export const Terminal: React.FC<TerminalProps> = ({ windowId, eventBus }) => {
  return (
    <TerminalContextProvider eventBus={eventBus}>
      <TerminalInner windowId={windowId} />
    </TerminalContextProvider>
  );
};
