import React from 'react';
import './ui.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="os-select-wrapper">
        {label && <label className="os-select-label">{label}</label>}
        <select
          ref={ref}
          className={`os-select ${error ? 'os-select-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'select-error' : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span id="select-error" className="os-select-error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

