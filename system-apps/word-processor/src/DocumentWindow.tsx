import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Window } from '@browser-os/windowing';
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import { createId } from '@browser-os/core';
import { useDocument } from './useDocument';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { MenuBar } from './MenuBar';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { Editor, EditorHandle } from './Editor';
import './DocumentWindow.css';

interface DocumentWindowProps {
  documentId: string;
  windowId: string;
  initialFileUri?: string;
  window?: Window; // Window instance passed from AppRenderer
}

export const DocumentWindow: React.FC<DocumentWindowProps> = ({
  documentId,
  windowId,
  initialFileUri,
  window: windowInstance,
}) => {
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const document = useDocument(documentId, initialFileUri);
  const editorRef = useRef<EditorHandle>(null);

  useEffect(() => {
    if (initialFileUri && !document.fileUri) {
      document.load(initialFileUri);
    }
  }, [initialFileUri, document]);

  const handleOpen = useCallback(() => {
    setShowOpenDialog(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (document.fileUri) {
      await document.save();
    } else {
      setShowSaveDialog(true);
    }
  }, [document]);

  const handleSaveAs = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleOpenDialogConfirm = useCallback(async (result: FileDialogResult) => {
    setShowOpenDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      await document.load(result.filePaths[0]);
    }
  }, [document]);

  const handleSaveDialogConfirm = useCallback(async (result: FileDialogResult) => {
    setShowSaveDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      await document.save(result.filePaths[0]);
    }
  }, [document]);

  const handleFormat = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.execCommand(command, value);
    }
  }, []);

  useKeyboardShortcuts(handleSave, handleOpen, () => {
    // Note: Opening new windows should be done via OS.launchApp()
    // This is legacy code that will be removed when word-processor is migrated
    console.warn('Opening new document windows should use OS.launchApp()');
  }, handleFormat);

  const windowTitle = document.fileUri
    ? document.fileUri.split('/').pop() + (document.modified ? ' *' : '')
    : 'Untitled' + (document.modified ? ' *' : '');

  useEffect(() => {
    if (windowInstance && windowInstance.title !== windowTitle) {
      windowInstance.setTitle(windowTitle, 'app');
    }
  }, [windowInstance, windowTitle]);

  return (
    <div className="document-window">
      <MenuBar
        onNew={() => {
          // Opening new windows should be done via OS.launchApp()
          // This functionality will be restored when word-processor is migrated to App class
          console.warn('Opening new document windows requires OS.launchApp() - word-processor needs migration');
        }}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onClose={() => {
          if (document.modified) {
            if (confirm('Document has unsaved changes. Close anyway?')) {
              // Window closing is handled by OS/AppManager
              // This is legacy code - word-processor should be migrated to App class
            }
          }
        }}
      />
      <Toolbar onFormat={handleFormat} />
      <div className="document-editor-container">
        <Editor
          ref={editorRef}
          content={document.content}
          onChange={document.setContent}
          onSelectionChange={document.setSelection}
        />
      </div>
      <StatusBar wordCount={document.wordCount} charCount={document.charCount} />
      
      <FileDialog
        open={showOpenDialog}
        mode="open"
        title="Open Document"
        filters={[
          { name: 'Text Files', extensions: ['txt', 'doc', 'docx'] },
          { name: 'All Files', extensions: ['*'] },
        ]}
        defaultPath="vfs://documents/"
        onClose={() => setShowOpenDialog(false)}
        onConfirm={handleOpenDialogConfirm}
      />
      
      <FileDialog
        open={showSaveDialog}
        mode="save"
        title="Save Document"
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

