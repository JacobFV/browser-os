import React from 'react';
import './Toolbar.css';

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser' | 'text' | 'polygon' | 'arrow' | 'brush';

export type ToolbarPosition = 'left' | 'bottom' | 'right';

export interface ToolbarProps {
  currentTool: DrawingTool;
  currentColor: string;
  brushSize: number;
  position: ToolbarPosition;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentColor,
  brushSize,
  position,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onClear,
}) => {
  const tools: { id: DrawingTool; label: string; icon: string }[] = [
    { id: 'pen', label: 'Pen', icon: '✏️' },
    { id: 'brush', label: 'Brush', icon: '🖌️' },
    { id: 'rectangle', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'line', label: 'Line', icon: '─' },
    { id: 'arrow', label: 'Arrow', icon: '→' },
    { id: 'polygon', label: 'Polygon', icon: '⬟' },
    { id: 'text', label: 'Text', icon: 'A' },
    { id: 'eraser', label: 'Eraser', icon: '🧹' },
  ];

  return (
    <div className={`draw-toolbar draw-toolbar-${position}`}>
      <div className="draw-toolbar-section">
        <div className="draw-toolbar-tools">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`draw-toolbar-tool ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
            >
              <span className="draw-toolbar-icon">{tool.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="draw-toolbar-section">
        <div className="draw-toolbar-color-wrapper">
          <div
            className="draw-toolbar-color-swatch"
            style={{ backgroundColor: currentColor }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = currentColor;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                onColorChange(target.value);
              };
              input.click();
            }}
          />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="draw-toolbar-color-text"
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="draw-toolbar-section">
        <div className="draw-toolbar-brush-size">
          <div className="draw-toolbar-brush-preview">
            <div
              className="draw-toolbar-brush-circle"
              style={{
                width: `${Math.min(brushSize * 2, 40)}px`,
                height: `${Math.min(brushSize * 2, 40)}px`,
                backgroundColor: currentColor,
              }}
            />
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value, 10))}
            className="draw-toolbar-brush-slider"
          />
          <input
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 50) {
                onBrushSizeChange(value);
              }
            }}
            className="draw-toolbar-brush-input"
          />
        </div>
      </div>

      <div className="draw-toolbar-section">
        <button className="draw-toolbar-button clear" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

