import React from 'react';
import './ui.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconPosition = 'left', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`os-button os-button-${variant} os-button-${size} ${className}`}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="os-button-icon-left">{icon}</span>}
        {children && <span className="os-button-content">{children}</span>}
        {icon && iconPosition === 'right' && <span className="os-button-icon-right">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="os-input-wrapper">
        {label && <label htmlFor={inputId} className="os-input-label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`os-input ${error ? 'os-input-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'input-error' : undefined}
          {...props}
        />
        {error && (
          <span id="input-error" className="os-input-error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="os-dialog-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      <div className="os-dialog" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="os-dialog-header">
            <h2 id="dialog-title" className="os-dialog-title">{title}</h2>
            <button
              className="os-dialog-close"
              onClick={onClose}
              aria-label="Close dialog"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <div className="os-dialog-content">{children}</div>
        {actions && <div className="os-dialog-footer">{actions}</div>}
      </div>
    </div>
  );
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, className = '' }) => {
  return (
    <span
      className={`os-icon os-icon-${name} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
