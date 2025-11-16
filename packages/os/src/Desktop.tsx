import React from 'react';
import './Desktop.css';

export const Desktop: React.FC = () => {
  return (
    <div className="os-desktop">
      <div className="os-desktop-background">
        <div className="os-desktop-branding">
          <img src="/favicon.svg" alt="Browser OS Icon" className="os-desktop-icon" />
          <span className="os-desktop-title">BROWSER-OS</span>
        </div>
        <div className="os-desktop-blurstorm">
          <div className="blur-blob blob-1"></div>
          <div className="blur-blob blob-2"></div>
          <div className="blur-blob blob-3"></div>
          <div className="blur-blob blob-4"></div>
          <div className="blur-blob blob-5"></div>
          <div className="blur-blob blob-6"></div>
        </div>
      </div>
      <div className="os-desktop-content">
        {/* Desktop icons, widgets, etc. can go here */}
      </div>
    </div>
  );
};

