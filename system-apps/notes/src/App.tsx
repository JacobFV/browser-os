import React, { useState, useRef, useEffect } from 'react';
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import { vfs } from '@browser-os/fs';
import './Notepad.css';

export const NotesApp: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [modified, setModified] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setShowOpenDialog(true);
  };

  const handleSave = async () => {
    if (fileUri) {
      try {
        await vfs.write(fileUri, content);
        setModified(false);
      } catch (error: any) {
        alert(`Failed to save: ${error.message}`);
      }
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleOpenDialogConfirm = async (result: FileDialogResult) => {
    setShowOpenDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      try {
        const fileContent = await vfs.read(result.filePaths[0], { binary: false }) as string;
        setContent(fileContent);
        setFileUri(result.filePaths[0]);
        setModified(false);
      } catch (error: any) {
        alert(`Failed to load file: ${error.message}`);
      }
    }
  };

  const handleSaveDialogConfirm = async (result: FileDialogResult) => {
    setShowSaveDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      try {
        await vfs.write(result.filePaths[0], content);
        setFileUri(result.filePaths[0]);
        setModified(false);
      } catch (error: any) {
        alert(`Failed to save: ${error.message}`);
      }
    }
  };

  const handleNew = () => {
    if (modified && !confirm('Unsaved changes will be lost. Continue?')) {
      return;
    }
    setContent('');
    setFileUri(null);
    setModified(false);
  };

  return (
    <div className="notepad-app">
      <div className="notepad-menu">
        <button onClick={handleNew}>File</button>
        <button onClick={handleOpen}>Open...</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleSaveAs}>Save As...</button>
      </div>
      <div className="notepad-title">
        {fileUri ? fileUri.split('/').pop() : 'Untitled'}
        {modified && ' *'}
      </div>
      <textarea
        ref={textareaRef}
        className="notepad-editor"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setModified(true);
        }}
        placeholder="Type your notes here..."
      />
      
      <FileDialog
        open={showOpenDialog}
        mode="open"
        title="Open File"
        filters={[
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ]}
        defaultPath="vfs://documents/"
        onClose={() => setShowOpenDialog(false)}
        onConfirm={handleOpenDialogConfirm}
      />
      
      <FileDialog
        open={showSaveDialog}
        mode="save"
        title="Save File"
        filters={[
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ]}
        defaultPath="vfs://documents/"
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleSaveDialogConfirm}
      />
    </div>
  );
};
