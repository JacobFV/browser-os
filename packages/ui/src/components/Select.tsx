import React from 'react';
import './Select.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ui-select-wrapper ${className}`}>
      {label && (
        <label htmlFor={selectId} className="ui-select-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`ui-select ${error ? 'ui-select-error' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <div className="ui-select-hint">{hint}</div>}
      {error && <div className="ui-select-error-text">{error}</div>}
    </div>
  );
};

