import React from 'react';
import { Toolbar as UIToolbar, Button, Separator, Select } from '@browser-os/ui';
import '@browser-os/ui/dist/ui.css';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onFormat }) => {
  return (
    <UIToolbar>
      <Button onClick={() => onFormat('bold')} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </Button>
      <Button onClick={() => onFormat('italic')} title="Italic (Ctrl+I)">
        <em>I</em>
      </Button>
      <Button onClick={() => onFormat('underline')} title="Underline (Ctrl+U)">
        <u>U</u>
      </Button>
      <Separator orientation="vertical" />
      <Select
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
      </Select>
      <Select
        onChange={(e) => onFormat('fontName', e.target.value)}
        defaultValue="Arial"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </Select>
      <Separator orientation="vertical" />
      <Button onClick={() => onFormat('justifyLeft')} title="Align Left">
        ⬅
      </Button>
      <Button onClick={() => onFormat('justifyCenter')} title="Align Center">
        ⬌
      </Button>
      <Button onClick={() => onFormat('justifyRight')} title="Align Right">
        ➡
      </Button>
    </UIToolbar>
  );
};

