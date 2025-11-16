import React, { useState, useRef, useEffect } from 'react';
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
  const [output, setOutput] = useState<string[]>(['Terminal v0.2.0', 'Type "help" for available commands.']);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const commandRegistryRef = useRef<CommandRegistry>(new CommandRegistry());

  // Command history is managed locally in TerminalInner

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (lines: string | string[]) => {
    const linesArray = Array.isArray(lines) ? lines : [lines];
    setOutput((prev) => [...prev, ...linesArray]);
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      return;
    }

    // Handle aliases
    const processedCmd = commandRegistryRef.current.resolveAliases(cmd.trim());

    // Add command to history
    const newHistory = [...commandHistory, cmd];
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);

    // Display command in output
    addOutput(`$ ${cmd}`);

    if (!context.isInitialized) {
      addOutput('Error: Filesystem not initialized. Please wait...');
      return;
    }

    // Handle clear command specially (it needs to modify output state)
    if (processedCmd.trim() === 'clear') {
      setOutput([]);
      return;
    }

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

    if (result.length > 0) {
      addOutput(result);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
    setCurrentCommand('');
    setHistoryIndex(commandHistory.length + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } else {
        setHistoryIndex(commandHistory.length);
        setCurrentCommand('');
      }
    }
  };

  const getPrompt = () => {
    const dirName = context.cwd === context.homeDir ? '~' : context.cwd.split('/').pop() || '/';
    return `user@browser-os:${dirName}$`;
  };

  return (
    <div className="terminal">
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      <form className="terminal-input-form" onSubmit={handleSubmit}>
        <span className="terminal-prompt">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};

export const Terminal: React.FC<TerminalProps> = ({ windowId, eventBus }) => {
  return (
    <TerminalContextProvider eventBus={eventBus}>
      <TerminalInner windowId={windowId} />
    </TerminalContextProvider>
  );
};
