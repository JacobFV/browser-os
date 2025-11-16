import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import type { EventBus } from '@browser-os/events';
import type { CommandContext } from './commands/types';

interface TerminalContextValue extends CommandContext {
  isInitialized: boolean;
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export interface TerminalContextProviderProps {
  children: ReactNode;
  eventBus?: EventBus;
  homeDir?: string;
}

export const TerminalContextProvider: React.FC<TerminalContextProviderProps> = ({
  children,
  eventBus,
  homeDir = '/home/user',
}) => {
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cwd, setCwd] = useState(homeDir);
  const [env, setEnvState] = useState<Record<string, string>>({});
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);
        
        // Ensure home directory exists
        if (!(await filesystem.exists(homeDir))) {
          await filesystem.mkdir(homeDir, { recursive: true });
        }
        
        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[TerminalContext] Failed to initialize filesystem:', error);
      }
    };

    initFS();
  }, [homeDir]);

  const setEnv = (newEnv: Record<string, string>) => {
    setEnvState(newEnv);
  };

  if (!fs || !isInitialized) {
    return null;
  }

  const contextValue: TerminalContextValue = {
    fs,
    cwd,
    env,
    eventBus,
    setCwd,
    setEnv,
    commandHistory: [], // Command history is managed by Terminal component
    homeDir,
    isInitialized,
    setCommandHistory,
  };

  return <TerminalContext.Provider value={contextValue}>{children}</TerminalContext.Provider>;
};

export const useTerminalContext = (): TerminalContextValue => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminalContext must be used within TerminalContextProvider');
  }
  return context;
};

