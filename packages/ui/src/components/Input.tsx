import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ui-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`ui-input ${error ? 'ui-input-error' : ''}`}
        {...props}
      />
      {hint && !error && <div className="ui-input-hint">{hint}</div>}
      {error && <div className="ui-input-error-text">{error}</div>}
    </div>
  );
};

