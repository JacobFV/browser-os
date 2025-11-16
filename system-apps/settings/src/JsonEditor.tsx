import React, { useState, useEffect } from 'react';

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  error?: string | null;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  error,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setLocalError(null);
    
    // Validate JSON
    try {
      JSON.parse(newValue);
      onChange(newValue);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const displayError = error || localError;

  return (
    <div className="json-editor">
      <div className="json-editor-toolbar">
        <button
          className="json-editor-button"
          onClick={handleFormat}
          disabled={readOnly}
          title="Format JSON"
        >
          Format
        </button>
      </div>
      <textarea
        className={`json-editor-textarea ${displayError ? 'error' : ''}`}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder="Enter JSON..."
      />
      {displayError && (
        <div className="json-editor-error">{displayError}</div>
      )}
    </div>
  );
};

