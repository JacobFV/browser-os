import React, { useState, useEffect } from 'react';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, onCommand }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command palette
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          autoFocus
        />
        <div className="command-results">
          {/* Command results will be rendered here */}
        </div>
      </div>
    </div>
  );
};

