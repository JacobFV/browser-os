import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  wordCount: number;
  charCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount }) => {
  return (
    <div className="status-bar">
      <div className="status-item">
        Words: {wordCount}
      </div>
      <div className="status-item">
        Characters: {charCount}
      </div>
    </div>
  );
};

