import React, { useState, useRef, useEffect } from 'react';
import './ui.css';

export interface MenuItemProps {
  label?: string;
  onClick?: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
}

export interface MenuProps {
  label: string;
  children: React.ReactNode;
}

export interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({ label, onClick, shortcut, disabled, separator }) => {
  if (separator) {
    return <div className="os-menu-separator" role="separator" />;
  }

  return (
    <div
      className={`os-menu-item ${disabled ? 'os-menu-item-disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className="os-menu-item-label">{label}</span>
      {shortcut && <span className="os-menu-item-shortcut">{shortcut}</span>}
    </div>
  );
};

export const Menu: React.FC<MenuProps> = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="os-menu" ref={menuRef}>
      <button
        className={`os-menu-button ${isOpen ? 'os-menu-button-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        {label}
      </button>
      {isOpen && (
        <div className="os-menu-dropdown" role="menu">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              // Check if it's a MenuItem by checking for separator prop or label prop
              if (child.type === MenuItem || (child.props as any).separator !== undefined || (child.props as any).label !== undefined) {
                return React.cloneElement(child, { key: index });
              }
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export const MenuBar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`os-menubar ${className}`}
        role="menubar"
        {...props}
      >
        {children}
      </div>
    );
  }
);

MenuBar.displayName = 'MenuBar';

