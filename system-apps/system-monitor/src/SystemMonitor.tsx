import React, { useState, useEffect } from 'react';
import './SystemMonitor.css';

interface Process {
  pid: number;
  ppid: number;
  name: string;
  status: string;
  cwd: string;
}

interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  hardwareConcurrency: number;
  online: boolean;
}

type Tab = 'processes' | 'performance' | 'info';

export const SystemMonitor: React.FC<{ os: any }> = ({ os }) => {
  const [activeTab, setActiveTab] = useState<Tab>('processes');

  return (
    <div className="system-monitor-app">
      <div className="monitor-tabs">
        <div 
          className={`monitor-tab ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          Processes
        </div>
        <div 
          className={`monitor-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </div>
        <div 
          className={`monitor-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          System Info
        </div>
      </div>
      
      <div className="monitor-content">
        {activeTab === 'processes' && <ProcessesView os={os} />}
        {activeTab === 'performance' && <PerformanceView os={os} />}
        {activeTab === 'info' && <InfoView os={os} />}
      </div>
    </div>
  );
};

const ProcessesView: React.FC<{ os: any }> = ({ os }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProcesses = async () => {
    try {
      // Use the syscall directly
      const procs = await os.syscall('proc.list');
      setProcesses(procs);
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2000);
    return () => clearInterval(interval);
  }, [os]);

  const handleKill = async () => {
    if (selectedPid === null) return;
    try {
      await os.syscall('proc.kill', { pid: selectedPid });
      setSelectedPid(null);
      fetchProcesses();
    } catch (error) {
      console.error('Failed to kill process:', error);
      // Could show error dialog here
    }
  };

  return (
    <>
      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>PID</th>
              <th>Status</th>
              <th>CWD</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(proc => (
              <tr 
                key={proc.pid} 
                className={selectedPid === proc.pid ? 'selected' : ''}
                onClick={() => setSelectedPid(proc.pid)}
              >
                <td>{proc.name}</td>
                <td>{proc.pid}</td>
                <td>{proc.status}</td>
                <td>{proc.cwd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="monitor-toolbar">
        <button 
          className="monitor-btn danger" 
          disabled={selectedPid === null}
          onClick={handleKill}
        >
          End Task
        </button>
      </div>
    </>
  );
};

const PerformanceView: React.FC<{ os: any }> = ({ os }) => {
  // Simulated stats since we don't have real hardware access
  const [cpuLoad, setCpuLoad] = useState(Math.floor(Math.random() * 30));
  const [memUsage, setMemUsage] = useState(40);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.min(100, Math.max(0, prev + change));
      });
      setMemUsage(prev => {
        const change = Math.floor(Math.random() * 6) - 3;
        return Math.min(100, Math.max(20, prev + change));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-view">
      <div className="stat-card">
        <div className="stat-title">CPU Usage</div>
        <div className="stat-value">{cpuLoad}%</div>
        <div className="stat-detail">Simulated Load</div>
        <div className="graph-placeholder">
          [CPU Graph]
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-title">Memory</div>
        <div className="stat-value">{memUsage}%</div>
        <div className="stat-detail">System Memory</div>
        <div className="graph-placeholder">
          [Memory Graph]
        </div>
      </div>
    </div>
  );
};

const InfoView: React.FC<{ os: any }> = ({ os }) => {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const [platform, userAgent, cores, online] = await Promise.all([
          os.syscall('system.getPlatform'),
          os.syscall('system.getUserAgent'),
          os.syscall('system.getHardwareConcurrency'),
          os.syscall('system.isOnline'),
        ]);
        
        setInfo({
          platform,
          userAgent,
          cores,
          online
        });
      } catch (error) {
        console.error('Failed to load system info:', error);
      }
    };
    
    loadInfo();
  }, [os]);

  if (!info) return <div style={{ padding: 20 }}>Loading info...</div>;

  return (
    <div className="performance-view">
      <div className="stat-card">
        <div className="stat-title">System</div>
        <div className="stat-detail">
          <strong>Platform:</strong> {info.platform}
        </div>
        <div className="stat-detail">
          <strong>Cores:</strong> {info.cores}
        </div>
        <div className="stat-detail">
          <strong>Status:</strong> {info.online ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <div className="stat-card" style={{ gridColumn: 'span 2' }}>
        <div className="stat-title">User Agent</div>
        <div className="stat-detail" style={{ wordBreak: 'break-all' }}>
          {info.userAgent}
        </div>
      </div>
    </div>
  );
};

