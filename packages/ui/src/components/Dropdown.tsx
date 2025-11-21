import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  hint?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  disabled = false,
  placeholder = 'Select an option...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus next option
          const currentIndex = options.findIndex(opt => opt.value === value);
          if (currentIndex < options.length - 1) {
            onChange(options[currentIndex + 1].value);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus previous option
          const currentIndex = options.findIndex(opt => opt.value === value);
          if (currentIndex > 0) {
            onChange(options[currentIndex - 1].value);
          }
        }
        break;
    }
  };

  return (
    <div className={`ui-dropdown-wrapper ${className}`} ref={dropdownRef}>
      {label && <label className="ui-dropdown-label">{label}</label>}
      
      <div
        className={`ui-dropdown-trigger ${isOpen ? 'ui-dropdown-open' : ''} ${error ? 'ui-dropdown-error' : ''} ${disabled ? 'ui-dropdown-disabled' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <span className="ui-dropdown-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="ui-dropdown-arrow"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="ui-dropdown-menu" role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              className={`ui-dropdown-option ${option.value === value ? 'ui-dropdown-option-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
              {option.value === value && (
                <svg
                  className="ui-dropdown-check"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3334 4L6.00002 11.3333L2.66669 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {hint && !error && <div className="ui-dropdown-hint">{hint}</div>}
      {error && <div className="ui-dropdown-error-text">{error}</div>}
    </div>
  );
};

