import React, { useState, useEffect } from 'react';
import { processManager, kill } from '@browser-os/process';
import { eventBus } from '@browser-os/core';
import './Monitor.css';

export const MonitorApp: React.FC = () => {
  const [processes, setProcesses] = useState(processManager.getAllProcesses());
  const [selectedPid, setSelectedPid] = useState<string | null>(null);

  useEffect(() => {
    const updateProcesses = () => {
      setProcesses([...processManager.getAllProcesses()]);
    };

    const unsubscribe = eventBus.on('proc', () => {
      updateProcesses();
    });

    // Update periodically
    const interval = setInterval(updateProcesses, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleKill = (pid: string) => {
    if (confirm(`Kill process ${pid}?`)) {
      kill(pid);
    }
  };

  const formatUptime = (startedAt: number): string => {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    if (mins > 0) return `${mins}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="monitor-app">
      <div className="monitor-header">
        <h2>Process Monitor</h2>
        <button onClick={() => setProcesses([...processManager.getAllProcesses()])}>
          Refresh
        </button>
      </div>
      <div className="monitor-table">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>App/Command</th>
              <th>State</th>
              <th>Uptime</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => (
              <tr
                key={proc.pid}
                className={selectedPid === proc.pid ? 'selected' : ''}
                onClick={() => setSelectedPid(proc.pid)}
              >
                <td>{proc.pid.slice(0, 8)}...</td>
                <td>{proc.appId || proc.command || 'unknown'}</td>
                <td>
                  <span className={`state-${proc.state}`}>{proc.state}</span>
                </td>
                <td>{formatUptime(proc.startedAt)}</td>
                <td>{proc.cpu ? `${proc.cpu.toFixed(1)}%` : '-'}</td>
                <td>{proc.mem ? `${(proc.mem / 1024).toFixed(1)} KB` : '-'}</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKill(proc.pid);
                    }}
                    disabled={proc.state === 'stopped' || proc.state === 'crashed'}
                  >
                    Kill
                  </button>
                </td>
              </tr>
            ))}
            {processes.length === 0 && (
              <tr>
                <td colSpan={7} className="monitor-empty">
                  No processes running
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedPid && (
        <div className="monitor-details">
          <h3>Process Details</h3>
          <pre>{JSON.stringify(processManager.getProcess(selectedPid), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
