import React from 'react';
import './Desktop.css';

export const Desktop: React.FC = () => {
  return (
    <div className="os-desktop">
      <div className="os-desktop-background" />
      <div className="os-desktop-content">
        {/* Desktop icons, widgets, etc. can go here */}
      </div>
    </div>
  );
};

