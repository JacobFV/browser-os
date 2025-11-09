import React from 'react';
import './ui.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="os-textarea-wrapper">
        {label && <label className="os-textarea-label">{label}</label>}
        <textarea
          ref={ref}
          className={`os-textarea ${error ? 'os-textarea-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'textarea-error' : undefined}
          {...props}
        />
        {error && (
          <span id="textarea-error" className="os-textarea-error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

