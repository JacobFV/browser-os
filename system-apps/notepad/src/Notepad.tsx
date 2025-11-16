import React, { useState, useEffect, useRef } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import type { EventBus } from '@browser-os/events';
import { SaveDialog, OpenDialog } from '@browser-os/dialogs';
import { Menubar } from './Menubar';
import './Notepad.css';

export interface NotepadProps {
  windowId: string;
  appId?: string;
  eventBus?: EventBus;
}

export const Notepad: React.FC<NotepadProps> = ({ windowId, appId = 'notepad', eventBus }) => {
  const [text, setText] = useState('');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Undo/Redo history
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const MAX_HISTORY_SIZE = 50;

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);
        
        // Ensure Documents directory exists
        if (!(await filesystem.exists('/home/user/Documents'))) {
          await filesystem.mkdir('/home/user/Documents', { recursive: true });
        }
        
        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[Notepad] Failed to initialize filesystem:', error);
      }
    };

    initFS();
  }, []);

  // Listen for file open events from context menu
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribe = eventBus.on('app:file:open', async (event: any) => {
      if (event.payload?.appId === appId && event.payload?.filePath && fs) {
        try {
          const data = await fs.read(event.payload.filePath);
          const content = new TextDecoder().decode(data);
          setText(content);
          setCurrentPath(event.payload.filePath);
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('[Notepad] Failed to open file from context menu:', error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [eventBus, appId, fs]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setHasUnsavedChanges(true);
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
      setHistoryIndex(MAX_HISTORY_SIZE - 1);
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    setHistory(newHistory);
  };

  const handleNew = () => {
    if (hasUnsavedChanges && text.trim()) {
      if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
        setText('');
        setCurrentPath(null);
        setHasUnsavedChanges(false);
        setHistory(['']);
        setHistoryIndex(0);
      }
    } else {
      setText('');
      setCurrentPath(null);
      setHasUnsavedChanges(false);
      setHistory(['']);
      setHistoryIndex(0);
    }
  };

  const handleOpen = () => {
    setShowOpenDialog(true);
  };

  const handleOpenFile = async (path: string) => {
    if (!fs) return;

    try {
      const data = await fs.read(path);
      const content = new TextDecoder().decode(data);
      setText(content);
      setCurrentPath(path);
      setHasUnsavedChanges(false);
      setShowOpenDialog(false);
      setHistory([content]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('[Notepad] Failed to open file:', error);
      alert('Failed to open file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSave = async () => {
    if (!fs) return;

    if (currentPath) {
      // Save to current path
      try {
        const data = new TextEncoder().encode(text);
        await fs.write(currentPath, data);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('[Notepad] Failed to save file:', error);
        alert('Failed to save file: ' + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      // Show save dialog
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleSaveFile = async (path: string) => {
    if (!fs) return;

    try {
      const data = new TextEncoder().encode(text);
      await fs.write(path, data);
      setCurrentPath(path);
      setHasUnsavedChanges(false);
      setShowSaveDialog(false);
    } catch (error) {
      console.error('[Notepad] Failed to save file:', error);
      alert('Failed to save file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleExit = () => {
    if (hasUnsavedChanges && text.trim()) {
      if (window.confirm('You have unsaved changes. Do you want to save before exiting?')) {
        handleSave();
      }
    }
    // Note: In a real app, this would close the window
    // For now, we'll just clear the content
    setText('');
    setCurrentPath(null);
    setHasUnsavedChanges(false);
    setHistory(['']);
    setHistoryIndex(0);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Clipboard handlers
  const handleCut = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
        const newText = text.substring(0, textarea.selectionStart) + text.substring(textarea.selectionEnd);
        setText(newText);
        setHasUnsavedChanges(true);
        
        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newText);
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
          setHistoryIndex(MAX_HISTORY_SIZE - 1);
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        setHistory(newHistory);
      } catch (error) {
        console.error('[Notepad] Failed to cut text:', error);
      }
    }
  };

  const handleCopy = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch (error) {
        console.error('[Notepad] Failed to copy text:', error);
      }
    }
  };

  const handlePaste = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    try {
      const clipboardText = await navigator.clipboard.readText();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + clipboardText + text.substring(end);
      setText(newText);
      setHasUnsavedChanges(true);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      setHistory(newHistory);
      
      // Set cursor position after pasted text
      setTimeout(() => {
        const newPosition = start + clipboardText.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    } catch (error) {
      console.error('[Notepad] Failed to paste text:', error);
    }
  };

  const handleSelectAll = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.select();
      textarea.focus();
    }
  };

  const handleToggleWordWrap = () => {
    setWordWrap(!wordWrap);
  };

  if (!isInitialized || !fs) {
    return (
      <div className="notepad-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="notepad">
      <Menubar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExit={handleExit}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        onToggleWordWrap={handleToggleWordWrap}
        wordWrap={wordWrap}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="notepad-content">
        <textarea
          ref={textareaRef}
          className={`notepad-textarea ${wordWrap ? 'notepad-textarea-wrap' : ''}`}
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>
      {showSaveDialog && eventBus && (
        <SaveDialog
          fs={fs}
          appId={appId}
          eventBus={eventBus}
          currentPath={currentPath || undefined}
          defaultExtension=".txt"
          fileFilter={(path) => path.endsWith('.txt')}
          onSave={handleSaveFile}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showOpenDialog && eventBus && (
        <OpenDialog
          fs={fs}
          appId={appId}
          eventBus={eventBus}
          fileFilter={(path) => path.endsWith('.txt')}
          onOpen={handleOpenFile}
          onCancel={() => setShowOpenDialog(false)}
        />
      )}
    </div>
  );
};

