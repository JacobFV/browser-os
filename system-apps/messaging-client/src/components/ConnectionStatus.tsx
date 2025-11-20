import React from 'react';
import './ConnectionStatus.css';

export interface ConnectionStatusProps {
  state: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ state }) => {
  const getStatusText = () => {
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getStatusClass = () => {
    switch (state) {
      case 'connected':
        return 'status-connected';
      case 'connecting':
      case 'reconnecting':
        return 'status-connecting';
      case 'disconnected':
        return 'status-disconnected';
      default:
        return '';
    }
  };

  return (
    <div className={`connection-status ${getStatusClass()}`}>
      <span className="status-dot"></span>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

