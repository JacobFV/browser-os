import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';

export interface TerminalProps {
  windowId: string;
}

export const Terminal: React.FC<TerminalProps> = ({ windowId }) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>(['Terminal v0.1.0', 'Type "help" for available commands.']);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) {
      return;
    }

    // Add command to history
    const newHistory = [...commandHistory, cmd];
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);

    // Display command in output
    setOutput((prev) => [...prev, `$ ${cmd}`]);

    // Parse and execute command
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let result: string[] = [];

    switch (command) {
      case 'help':
        result = [
          'Available commands:',
          '  help     - Show this help message',
          '  clear    - Clear the terminal screen',
          '  echo     - Print text to the terminal',
          '  history  - Show command history',
        ];
        break;

      case 'clear':
        setOutput([]);
        return;

      case 'echo':
        result = [args.join(' ') || ''];
        break;

      case 'history':
        if (commandHistory.length === 0) {
          result = ['No commands in history.'];
        } else {
          result = commandHistory.map((cmd, idx) => `${idx + 1}. ${cmd}`);
        }
        break;

      default:
        result = [`Command not found: ${command}. Type "help" for available commands.`];
    }

    setOutput((prev) => [...prev, ...result]);
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
        <span className="terminal-prompt">$</span>
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

