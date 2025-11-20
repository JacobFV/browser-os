import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import type { ProcessInfo, SortColumn, SortDirection } from './types';
import type { EventBus } from '@browser-os/events';
import { createSyscallWrapper } from './useSyscall';
import './ProcessManager.css';

interface ProcessListViewProps {
  eventBus: EventBus;
  selectedPid: number | null;
  onSelectProcess: (pid: number | null) => void;
  onKillProcess: (pid: number, signal: 'SIGTERM' | 'SIGKILL') => Promise<void>;
  onProcessesChange?: (processes: ProcessInfo[]) => void;
}

export const ProcessListView: React.FC<ProcessListViewProps> = ({
  eventBus,
  selectedPid,
  onSelectProcess,
  onKillProcess,
  onProcessesChange,
}) => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'stopped' | 'terminated'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);

  const syscall = useMemo(() => createSyscallWrapper(eventBus), [eventBus]);

  const fetchProcesses = useCallback(async () => {
    try {
      setError(null);
      const result = await syscall('proc.list', {});
      const processList = Array.isArray(result) ? result : [];
      setProcesses(processList as ProcessInfo[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch processes';
      setError(errorMessage);
      console.error('Failed to fetch processes:', err);
    } finally {
      setLoading(false);
    }
  }, [syscall]);

  // Expose processes to parent via callback (for ProcessTreeView)
  useEffect(() => {
    if (onProcessesChange) {
      onProcessesChange(processes);
    }
  }, [processes, onProcessesChange]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchProcesses();

    if (!autoRefresh) return;

    const interval = setInterval(fetchProcesses, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchProcesses, autoRefresh, refreshInterval]);

  // Subscribe to process events for real-time updates
  useEffect(() => {
    const handleSpawned = () => {
      if (autoRefresh) {
        fetchProcesses();
      }
    };

    const handleTerminated = () => {
      if (autoRefresh) {
        fetchProcesses();
      }
    };

    const handleStatusChanged = () => {
      if (autoRefresh) {
        fetchProcesses();
      }
    };

    const unsubscribeSpawned = eventBus.on('proc:spawned', handleSpawned);
    const unsubscribeTerminated = eventBus.on('proc:terminated', handleTerminated);
    const unsubscribeStatusChanged = eventBus.on('proc:status-changed', handleStatusChanged);

    return () => {
      unsubscribeSpawned();
      unsubscribeTerminated();
      unsubscribeStatusChanged();
    };
  }, [eventBus, autoRefresh, fetchProcesses]);

  // Filter and sort processes
  const filteredAndSortedProcesses = useMemo(() => {
    let filtered = processes.filter((proc) => {
      const matchesText =
        filterText === '' ||
        proc.name.toLowerCase().includes(filterText.toLowerCase()) ||
        proc.pid.toString().includes(filterText) ||
        proc.cwd.toLowerCase().includes(filterText.toLowerCase());

      const matchesStatus = filterStatus === 'all' || proc.status === filterStatus;

      return matchesText && matchesStatus;
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortColumn) {
          case 'pid':
            aVal = a.pid;
            bVal = b.pid;
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'ppid':
            aVal = a.ppid ?? 0;
            bVal = b.ppid ?? 0;
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          case 'cwd':
            aVal = a.cwd.toLowerCase();
            bVal = b.cwd.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [processes, filterText, filterStatus, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-badge status-running';
      case 'stopped':
        return 'status-badge status-stopped';
      case 'terminated':
        return 'status-badge status-terminated';
      default:
        return 'status-badge';
    }
  };

  if (loading && processes.length === 0) {
    return (
      <div className="process-list-loading">
        <div>Loading processes...</div>
      </div>
    );
  }

  return (
    <div className="process-list-view">
      {/* Filters and Controls */}
      <div className="process-list-controls">
        <div className="process-list-filters">
          <input
            type="text"
            className="process-filter-input"
            placeholder="Search by name, PID, or path..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select
            className="process-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <div className="process-list-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button className="process-refresh-btn" onClick={fetchProcesses} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="process-list-error">
          <span>{error}</span>
          <button onClick={fetchProcesses}>Retry</button>
        </div>
      )}

      {/* Process Table */}
      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('pid')} className="sortable">
                PID {getSortIcon('pid')}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('ppid')} className="sortable">
                PPID {getSortIcon('ppid')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('cwd')} className="sortable">
                Working Directory {getSortIcon('cwd')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProcesses.length === 0 ? (
              <tr>
                <td colSpan={5} className="process-table-empty">
                  No processes found
                </td>
              </tr>
            ) : (
              filteredAndSortedProcesses.map((proc) => (
                <ProcessRow
                  key={proc.pid}
                  process={proc}
                  isSelected={selectedPid === proc.pid}
                  onSelect={() => onSelectProcess(proc.pid)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Count */}
      <div className="process-list-footer">
        <span>
          Showing {filteredAndSortedProcesses.length} of {processes.length} processes
        </span>
      </div>
    </div>
  );
};

// Helper function for status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'running':
      return 'status-badge status-running';
    case 'stopped':
      return 'status-badge status-stopped';
    case 'terminated':
      return 'status-badge status-terminated';
    default:
      return 'status-badge';
  }
};

// Memoized process row component for performance
const ProcessRow = memo<{
  process: ProcessInfo;
  isSelected: boolean;
  onSelect: () => void;
}>(({ process, isSelected, onSelect }) => {
  return (
    <tr
      className={`process-row ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <td>{process.pid}</td>
      <td className="process-name">{process.name}</td>
      <td>{process.ppid ?? '-'}</td>
      <td>
        <span className={getStatusBadgeClass(process.status)}>{process.status}</span>
      </td>
      <td className="process-cwd" title={process.cwd}>
        {process.cwd}
      </td>
    </tr>
  );
});

ProcessRow.displayName = 'ProcessRow';

