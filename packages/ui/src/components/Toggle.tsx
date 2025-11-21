import React from 'react';
import './Toggle.css';

export interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  hint,
  disabled = false,
}) => {
  const toggleId = `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui-toggle-wrapper">
      <div className="ui-toggle-content">
        {label && (
          <label htmlFor={toggleId} className="ui-toggle-label">
            {label}
          </label>
        )}
        <button
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          className={`ui-toggle ${checked ? 'ui-toggle-checked' : ''} ${disabled ? 'ui-toggle-disabled' : ''}`}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
        >
          <span className="ui-toggle-thumb" />
        </button>
      </div>
      {hint && <div className="ui-toggle-hint">{hint}</div>}
    </div>
  );
};

