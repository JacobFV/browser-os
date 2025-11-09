import React from 'react';
import { StatusBar as UIStatusBar } from '@browser-os/ui';
import '@browser-os/ui/dist/ui.css';

interface StatusBarProps {
  wordCount: number;
  charCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount }) => {
  return (
    <UIStatusBar>
      <span>Words: {wordCount}</span>
      <span>Characters: {charCount}</span>
    </UIStatusBar>
  );
};

