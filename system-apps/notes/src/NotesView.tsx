import React, { useState, useRef } from 'react';
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import { VfsImpl } from '@browser-os/fs';
import { Toolbar, Button, StatusBar, Textarea } from '@browser-os/ui';
import { Window } from '@browser-os/windowing';
import '@browser-os/ui/dist/ui.css';
import './Notepad.css';

interface NotesViewProps {
  window: Window;
  vfs: VfsImpl;
}

export const NotesView: React.FC<NotesViewProps> = ({ window, vfs }) => {
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
    <div className="notepad-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Button onClick={handleNew}>File</Button>
        <Button onClick={handleOpen}>Open...</Button>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleSaveAs}>Save As...</Button>
      </Toolbar>
      <StatusBar>
        {fileUri ? fileUri.split('/').pop() : 'Untitled'}
        {modified && ' *'}
      </StatusBar>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setModified(true);
        }}
        placeholder="Type your notes here..."
        style={{ flex: 1, width: '100%', border: 'none', resize: 'none' }}
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

