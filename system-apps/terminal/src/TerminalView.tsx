import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { ShellProcess } from './ShellProcess';
import { Window } from '@browser-os/windowing';
import './Terminal.css';

export interface TerminalViewProps {
  shell: ShellProcess;
  window: Window;
  initialDir?: string;
}

/**
 * TerminalView - Pure UI component that renders terminal UI
 * Receives ShellProcess instance, doesn't own it
 */
export const TerminalView: React.FC<TerminalViewProps> = ({ shell, window: windowInstance, initialDir }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const currentCommandRef = useRef<string>('');
  
  // Update window title when cwd changes
  useEffect(() => {
    const updateTitle = () => {
      const cwd = shell.getCwd();
      const dirName = cwd.split('/').filter(Boolean).pop() || '/';
      windowInstance.setTitle(`Terminal - ${dirName}`, 'app');
    };
    
    // Subscribe to cwd changes (we'll need to add this to ShellProcess)
    // For now, update on mount
    updateTitle();
  }, [shell, windowInstance]);
  
  const prompt = useCallback((xterm: XTerm) => {
    xterm.write(shell.getPrompt());
  }, [shell]);
  
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
    
    // Wait for next frame to ensure container has dimensions
    requestAnimationFrame(() => {
      fitAddon.fit();
    });
    
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;
    
    // Print welcome message
    xterm.writeln('browser-os Terminal v1.0');
    xterm.writeln('Type "help" for available commands.');
    xterm.writeln('');
    
    // Subscribe to shell output
    const unsubscribeOutput = shell.onOutput((data) => {
      xterm.write(data);
    });
    
    const unsubscribeError = shell.onError((data) => {
      xterm.write(data);
    });
    
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
          shell.addToHistory(command);
          setHistory(prev => [...prev, command]);
          setHistoryIndex(-1);
          
          try {
            await shell.executeCommandLine(command);
          } catch (error: any) {
            xterm.writeln(`Error: ${error.message}`);
          }
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
        const shellHistory = shell.getHistory();
        if (shellHistory.length > 0) {
          const newIndex = historyIndex === -1 ? shellHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          const histCommand = shellHistory[newIndex];
          // Clear current line and write history command
          xterm.write('\r\x1b[K');
          currentCommandRef.current = histCommand;
          xterm.write(histCommand);
        }
      } else if (data === '\x1b[B') {
        // Down arrow - history
        const shellHistory = shell.getHistory();
        if (historyIndex >= 0) {
          const newIndex = historyIndex + 1;
          if (newIndex < shellHistory.length) {
            setHistoryIndex(newIndex);
            const histCommand = shellHistory[newIndex];
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
          // We'd need access to processManager here - for now skip
          // Could pass it as prop or access via shell
        } else {
          // Complete file path - would need vfs access
          // For now skip
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
    
    // Ensure xterm is focusable
    xterm.options.cursorBlink = true;
    xterm.options.cursorStyle = 'block';
    
    prompt(xterm);
    
    // Focus the terminal after a short delay to ensure it's ready
    setTimeout(() => {
      xterm.focus();
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribeOutput();
      unsubscribeError();
      xterm.dispose();
    };
  }, [shell, prompt]);
  
  return (
    <div className="terminal-app">
      <div ref={terminalRef} className="terminal-container" />
    </div>
  );
};

