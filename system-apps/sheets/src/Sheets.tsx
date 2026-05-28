import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Sheets.css';

export interface SheetsProps {
  windowId?: string;
  appId?: string;
  os?: any;
}

const NUM_COLS = 26; // A-Z
const NUM_ROWS = 50;

function colLabel(index: number): string {
  // index 0 -> A
  return String.fromCharCode(65 + index);
}

function cellKey(row: number, col: number): string {
  return `${colLabel(col)}${row + 1}`;
}

type CellData = Record<string, string>;

const SEED: CellData = {
  A1: 'Item',
  B1: 'Q1',
  C1: 'Q2',
  D1: 'Total',
  A2: 'Widgets',
  B2: '120',
  C2: '150',
  D2: '=SUM(B2:C2)',
  A3: 'Gadgets',
  B3: '90',
  C3: '110',
  D3: '=SUM(B3:C3)',
  A4: 'Gizmos',
  B4: '60',
  C4: '75',
  D4: '=SUM(B4:C4)',
  A5: 'Total',
  B5: '=SUM(B2:B4)',
  C5: '=SUM(C2:C4)',
  D5: '=SUM(D2:D4)',
};

export const Sheets: React.FC<SheetsProps> = () => {
  const [cells, setCells] = useState<CellData>(SEED);
  const [selected, setSelected] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);
  const formulaRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const selKey = cellKey(selected.row, selected.col);
  const selValue = cells[selKey] ?? '';

  const setCellValue = useCallback((key: string, value: string) => {
    setCells((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const handleSelect = (row: number, col: number) => {
    setSelected({ row, col });
    setEditing(null);
  };

  const handleDoubleClick = (row: number, col: number) => {
    setSelected({ row, col });
    setEditing({ row, col });
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (editing) return;
    const { row, col } = selected;
    if (e.key === 'ArrowUp' && row > 0) {
      e.preventDefault();
      setSelected({ row: row - 1, col });
    } else if (e.key === 'ArrowDown' && row < NUM_ROWS - 1) {
      e.preventDefault();
      setSelected({ row: row + 1, col });
    } else if (e.key === 'ArrowLeft' && col > 0) {
      e.preventDefault();
      setSelected({ row, col: col - 1 });
    } else if ((e.key === 'ArrowRight' || e.key === 'Tab') && col < NUM_COLS - 1) {
      e.preventDefault();
      setSelected({ row, col: col + 1 });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setEditing({ row, col });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setCellValue(selKey, '');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Start typing -> begin editing with this char
      setCellValue(selKey, e.key);
      setEditing({ row, col });
    }
  };

  // Focus formula bar input is left to the user; keep grid focusable.
  useEffect(() => {
    if (!editing && gridRef.current) {
      // keep selection visible
    }
  }, [editing]);

  return (
    <div className="sheets">
      <div className="sheets-toolbar">
        <span className="sheets-logo">Sheets</span>
        <div className="sheets-toolbar-actions">
          <button className="sheets-tool-btn" title="Bold" type="button">B</button>
          <button className="sheets-tool-btn" title="Italic" type="button"><i>I</i></button>
          <button className="sheets-tool-btn" title="Sum" type="button">Σ</button>
        </div>
      </div>
      <div className="sheets-formula-bar">
        <span className="sheets-cell-ref">{selKey}</span>
        <span className="sheets-fx">fx</span>
        <input
          ref={formulaRef}
          className="cell-input"
          type="text"
          value={selValue}
          onChange={(e) => setCellValue(selKey, e.target.value)}
          placeholder="Enter a value or formula"
          spellCheck={false}
        />
      </div>
      <div
        className="sheets-grid-wrap"
        ref={gridRef}
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
      >
        <table className="sheets-grid">
          <thead>
            <tr>
              <th className="sheets-corner"></th>
              {Array.from({ length: NUM_COLS }, (_, c) => (
                <th
                  key={c}
                  className={`sheets-col-header ${c === selected.col ? 'sheets-header-active' : ''}`}
                >
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: NUM_ROWS }, (_, r) => (
              <tr key={r}>
                <th
                  className={`sheets-row-header ${r === selected.row ? 'sheets-header-active' : ''}`}
                >
                  {r + 1}
                </th>
                {Array.from({ length: NUM_COLS }, (_, c) => {
                  const key = cellKey(r, c);
                  const isSelected = r === selected.row && c === selected.col;
                  const isEditing = editing && editing.row === r && editing.col === c;
                  const value = cells[key] ?? '';
                  return (
                    <td
                      key={c}
                      className={`sheets-cell ${isSelected ? 'sheets-cell-selected' : ''}`}
                      onClick={() => handleSelect(r, c)}
                      onDoubleClick={() => handleDoubleClick(r, c)}
                    >
                      {isEditing ? (
                        <input
                          className="sheets-cell-edit"
                          autoFocus
                          type="text"
                          value={value}
                          onChange={(e) => setCellValue(key, e.target.value)}
                          onBlur={() => setEditing(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setEditing(null);
                              if (r < NUM_ROWS - 1) setSelected({ row: r + 1, col: c });
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditing(null);
                            } else if (e.key === 'Tab') {
                              e.preventDefault();
                              setEditing(null);
                              if (c < NUM_COLS - 1) setSelected({ row: r, col: c + 1 });
                            }
                          }}
                          spellCheck={false}
                        />
                      ) : (
                        <span className="sheets-cell-text">{value}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
