import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`ui-button ui-button-${variant} ui-button-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

