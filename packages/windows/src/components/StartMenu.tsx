import React from 'react';
import './StartMenu.css';

export interface StartMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: StartMenuItem[];
}

export interface StartMenuProps {
  items?: StartMenuItem[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  items = [],
  isOpen = false,
  onClose,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="browser-os-startmenu__overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`browser-os-startmenu ${className}`}>
        <div className="browser-os-startmenu__header">
          <span className="browser-os-startmenu__header-text">Windows</span>
        </div>
        <div className="browser-os-startmenu__content">
          {items.map((item, index) => (
            <div
              key={index}
              className="browser-os-startmenu__item"
              onClick={item.onClick}
            >
              {item.icon && (
                <span className="browser-os-startmenu__item-icon">
                  {item.icon}
                </span>
              )}
              <span className="browser-os-startmenu__item-label">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

