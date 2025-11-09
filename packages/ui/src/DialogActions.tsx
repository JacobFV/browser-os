import React from 'react';
import './ui.css';

export interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogActions = React.forwardRef<HTMLDivElement, DialogActionsProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`os-dialog-actions ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DialogActions.displayName = 'DialogActions';

