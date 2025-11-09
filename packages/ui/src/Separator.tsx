import React from 'react';
import './ui.css';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`os-separator os-separator-${orientation} ${className}`}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

