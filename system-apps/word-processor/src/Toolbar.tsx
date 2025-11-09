import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onFormat }) => {
  return (
    <div className="toolbar">
      <button
        className="toolbar-btn"
        onClick={() => onFormat('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => onFormat('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => onFormat('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <div className="toolbar-separator" />
      <select
        className="toolbar-select"
        onChange={(e) => onFormat('fontSize', e.target.value)}
        defaultValue="3"
      >
        <option value="1">8pt</option>
        <option value="2">10pt</option>
        <option value="3">12pt</option>
        <option value="4">14pt</option>
        <option value="5">18pt</option>
        <option value="6">24pt</option>
        <option value="7">36pt</option>
      </select>
      <select
        className="toolbar-select"
        onChange={(e) => onFormat('fontName', e.target.value)}
        defaultValue="Arial"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>
      <div className="toolbar-separator" />
      <button
        className="toolbar-btn"
        onClick={() => onFormat('justifyLeft')}
        title="Align Left"
      >
        ⬅
      </button>
      <button
        className="toolbar-btn"
        onClick={() => onFormat('justifyCenter')}
        title="Align Center"
      >
        ⬌
      </button>
      <button
        className="toolbar-btn"
        onClick={() => onFormat('justifyRight')}
        title="Align Right"
      >
        ➡
      </button>
    </div>
  );
};

