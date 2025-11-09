import React from 'react';

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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
      />
      <div
        className={`browser-os-startmenu ${className}`}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: 0,
          width: '200px',
          background: '#c0c0c0',
          border: '2px outset #c0c0c0',
          zIndex: 9999,
          fontFamily: "'MS Sans Serif', sans-serif",
        }}
      >
        <div
          className="browser-os-startmenu__header"
          style={{
            background: 'linear-gradient(to bottom, #008080, #004080)',
            color: 'white',
            padding: '4px 8px',
            fontWeight: 'bold',
            fontSize: '11px',
          }}
        >
          <span className="browser-os-startmenu__header-text">Windows</span>
        </div>
        <div
          className="browser-os-startmenu__content"
          style={{
            padding: '2px',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="browser-os-startmenu__item"
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '11px',
                color: 'black',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000080';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'black';
              }}
            >
              {item.icon && (
                <span
                  className="browser-os-startmenu__item-icon"
                  style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </span>
              )}
              <span
                className="browser-os-startmenu__item-label"
                style={{
                  flex: 1,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

