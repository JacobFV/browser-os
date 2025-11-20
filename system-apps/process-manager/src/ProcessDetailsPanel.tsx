import React, { useState, useEffect, useMemo } from 'react';
import type { ProcessInfo } from './types';
import type { EventBus } from '@browser-os/events';
import { createSyscallWrapper } from './useSyscall';
import './ProcessManager.css';

interface ProcessDetailsPanelProps {
  eventBus: EventBus;
  pid: number | null;
  onClose: () => void;
  onKillProcess: (pid: number, signal: 'SIGTERM' | 'SIGKILL') => Promise<void>;
}

export const ProcessDetailsPanel: React.FC<ProcessDetailsPanelProps> = ({
  eventBus,
  pid,
  onClose,
  onKillProcess,
}) => {
  const [process, setProcess] = useState<ProcessInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEnv, setShowEnv] = useState(false);
  const [killing, setKilling] = useState(false);

  const syscall = useMemo(() => createSyscallWrapper(eventBus), [eventBus]);

  useEffect(() => {
    if (!pid) {
      setProcess(null);
      return;
    }

    const fetchProcessDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await syscall('proc.get', { pid });
        if (result) {
          setProcess(result as ProcessInfo);
        } else {
          setError('Process not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch process details';
        setError(errorMessage);
        console.error('Failed to fetch process details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessDetails();
  }, [pid, syscall]);

  const handleKill = async (signal: 'SIGTERM' | 'SIGKILL') => {
    if (!pid || killing) return;

    const signalName = signal === 'SIGTERM' ? 'Terminate' : 'Force Kill';
    const confirmed = window.confirm(
      `Are you sure you want to ${signalName.toLowerCase()} process ${pid} (${process?.name || 'unknown'})?`
    );

    if (!confirmed) return;

    setKilling(true);
    try {
      await onKillProcess(pid, signal);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to kill process';
      alert(`Error: ${errorMessage}`);
      console.error('Failed to kill process:', err);
    } finally {
      setKilling(false);
    }
  };

  if (!pid) {
    return null;
  }

  return (
    <div className="process-details-panel">
      <div className="process-details-header">
        <h2>Process Details</h2>
        <button className="process-details-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="process-details-content">
        {loading && !process ? (
          <div className="process-details-loading">Loading process details...</div>
        ) : error ? (
          <div className="process-details-error">
            <p>{error}</p>
            <button onClick={() => pid && fetchProcessDetails()}>Retry</button>
          </div>
        ) : process ? (
          <>
            {/* Basic Information */}
            <div className="process-details-section">
              <h3>Basic Information</h3>
              <div className="process-details-grid">
                <div className="process-details-item">
                  <label>Process ID (PID)</label>
                  <span>{process.pid}</span>
                </div>
                <div className="process-details-item">
                  <label>Parent PID (PPID)</label>
                  <span>{process.ppid ?? '-'}</span>
                </div>
                <div className="process-details-item">
                  <label>Name</label>
                  <span className="process-name">{process.name}</span>
                </div>
                <div className="process-details-item">
                  <label>Status</label>
                  <span className={`status-badge status-${process.status}`}>{process.status}</span>
                </div>
                <div className="process-details-item" style={{ gridColumn: 'span 2' }}>
                  <label>Working Directory</label>
                  <span className="process-cwd" title={process.cwd}>
                    {process.cwd}
                  </span>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            {process.env && Object.keys(process.env).length > 0 && (
              <div className="process-details-section">
                <h3>
                  Environment Variables
                  <button
                    className="process-details-toggle"
                    onClick={() => setShowEnv(!showEnv)}
                  >
                    {showEnv ? 'Hide' : 'Show'}
                  </button>
                </h3>
                {showEnv && (
                  <div className="process-details-env">
                    {Object.entries(process.env).map(([key, value]) => (
                      <div key={key} className="process-details-env-item">
                        <span className="process-details-env-key">{key}</span>
                        <span className="process-details-env-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="process-details-section">
              <h3>Actions</h3>
              <div className="process-details-actions">
                <button
                  className="process-action-btn process-action-kill"
                  onClick={() => handleKill('SIGTERM')}
                  disabled={killing || process.status === 'terminated'}
                >
                  {killing ? 'Killing...' : 'Terminate Process'}
                </button>
                <button
                  className="process-action-btn process-action-force-kill"
                  onClick={() => handleKill('SIGKILL')}
                  disabled={killing || process.status === 'terminated'}
                >
                  {killing ? 'Killing...' : 'Force Kill'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

