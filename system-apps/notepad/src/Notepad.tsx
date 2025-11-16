import React, { useState, useEffect, useRef } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import { Menubar } from './Menubar';
import { SaveDialog } from './SaveDialog';
import { OpenDialog } from './OpenDialog';
import './Notepad.css';

export interface NotepadProps {
  windowId: string;
}

export const Notepad: React.FC<NotepadProps> = ({ windowId }) => {
  const [text, setText] = useState('');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleNew = () => {
    if (hasUnsavedChanges && text.trim()) {
      if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
        setText('');
        setCurrentPath(null);
        setHasUnsavedChanges(false);
      }
    } else {
      setText('');
      setCurrentPath(null);
      setHasUnsavedChanges(false);
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
      />
      <div className="notepad-content">
        <textarea
          ref={textareaRef}
          className="notepad-textarea"
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>
      {showSaveDialog && (
        <SaveDialog
          fs={fs}
          currentPath={currentPath || undefined}
          onSave={handleSaveFile}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showOpenDialog && (
        <OpenDialog
          fs={fs}
          onOpen={handleOpenFile}
          onCancel={() => setShowOpenDialog(false)}
        />
      )}
    </div>
  );
};

