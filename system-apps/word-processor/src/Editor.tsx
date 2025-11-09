import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import './Editor.css';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (selection: Selection | null) => void;
}

export interface EditorHandle {
  focus: () => void;
  execCommand: (command: string, value?: string) => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ content, onChange, onSelectionChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      execCommand: (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      },
    }));

    useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        editorRef.current.innerHTML = content;
        if (range && selection) {
          try {
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // Ignore selection errors
          }
        }
      }
    }, [content]);

    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const handleSelectionChange = () => {
      if (onSelectionChange) {
        const selection = window.getSelection();
        onSelectionChange(selection);
      }
    };

    return (
      <div
        ref={editorRef}
        className="word-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onSelect={handleSelectionChange}
      />
    );
  }
);

Editor.displayName = 'Editor';

