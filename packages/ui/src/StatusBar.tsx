import React from 'react';
import './ui.css';

export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`os-statusbar ${className}`}
        role="status"
        aria-live="polite"
        {...props}
      >
        {children}
      </div>
    );
  }
);

StatusBar.displayName = 'StatusBar';

