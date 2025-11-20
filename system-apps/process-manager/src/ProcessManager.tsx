import React, { useState, useCallback, useMemo } from 'react';
import type { ProcessManagerProps } from './types';
import { ProcessListView } from './ProcessListView';
import { ProcessDetailsPanel } from './ProcessDetailsPanel';
import { ProcessTreeView } from './ProcessTreeView';
import { createSyscallWrapper } from './useSyscall';
import type { ProcessInfo } from './types';
import './ProcessManager.css';

type View = 'list' | 'tree';

// Support both eventBus-only and os prop patterns
interface ProcessManagerPropsWithOS extends ProcessManagerProps {
  os?: {
    syscall: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
}

export const ProcessManager: React.FC<ProcessManagerPropsWithOS> = ({ eventBus, os }) => {
  const [activeView, setActiveView] = useState<View>('list');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);

  // Use os.syscall if available, otherwise use eventBus wrapper
  const syscall = useMemo(() => {
    if (os?.syscall) {
      return os.syscall;
    }
    return createSyscallWrapper(eventBus);
  }, [eventBus, os]);

  const handleSelectProcess = useCallback((pid: number | null) => {
    setSelectedPid(pid);
    setShowDetails(pid !== null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedPid(null);
    setShowDetails(false);
  }, []);

  const handleKillProcess = useCallback(async (pid: number, signal: 'SIGTERM' | 'SIGKILL') => {
    try {
      await syscall('proc.kill', { pid, signal });
      // Refresh process list after killing
      const result = await syscall('proc.list', {});
      const processList = Array.isArray(result) ? result : [];
      setProcesses(processList as ProcessInfo[]);
    } catch (error) {
      console.error('Failed to kill process:', error);
      throw error;
    }
  }, [syscall]);

  // Calculate process statistics
  const stats = useMemo(() => {
    const running = processes.filter((p) => p.status === 'running').length;
    const stopped = processes.filter((p) => p.status === 'stopped').length;
    const terminated = processes.filter((p) => p.status === 'terminated').length;
    return {
      total: processes.length,
      running,
      stopped,
      terminated,
    };
  }, [processes]);

  return (
    <div className="process-manager-app">
      {/* Header */}
      <div className="process-manager-header">
        <h1>Process Manager</h1>
        <div className="process-manager-tabs">
          <button
            className={`process-manager-tab ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            Processes
          </button>
          <button
            className={`process-manager-tab ${activeView === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveView('tree')}
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="process-manager-content">
        {activeView === 'list' ? (
          <ProcessListView
            eventBus={eventBus}
            selectedPid={selectedPid}
            onSelectProcess={handleSelectProcess}
            onKillProcess={handleKillProcess}
            onProcessesChange={setProcesses}
          />
        ) : (
          <ProcessTreeView
            processes={processes}
            selectedPid={selectedPid}
            onSelectProcess={handleSelectProcess}
          />
        )}

        {/* Process Details Panel */}
        {showDetails && selectedPid !== null && (
          <ProcessDetailsPanel
            eventBus={eventBus}
            pid={selectedPid}
            onClose={handleCloseDetails}
            onKillProcess={handleKillProcess}
          />
        )}
      </div>

      {/* Footer with Statistics */}
      <div className="process-manager-footer">
        <div className="process-stats">
          <span className="process-stat">
            <strong>Total:</strong> {stats.total}
          </span>
          <span className="process-stat">
            <strong>Running:</strong> <span className="stat-running">{stats.running}</span>
          </span>
          <span className="process-stat">
            <strong>Stopped:</strong> <span className="stat-stopped">{stats.stopped}</span>
          </span>
          <span className="process-stat">
            <strong>Terminated:</strong> <span className="stat-terminated">{stats.terminated}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
