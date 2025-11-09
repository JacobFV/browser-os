import React from 'react';
import './ui.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="os-checkbox-wrapper">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`os-checkbox ${error ? 'os-checkbox-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'checkbox-error' : undefined}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="os-checkbox-label">
            {label}
          </label>
        )}
        {error && (
          <span id="checkbox-error" className="os-checkbox-error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

