import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { vfs } from '@browser-os/fs';
import { FileDialog, FileDialogResult } from '@browser-os/dialogs';
import './Editor.css';

export const EditorApp: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value: '',
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
    });

    monacoEditorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      setModified(true);
    });

    return () => {
      editor.dispose();
    };
  }, []);

  const handleOpen = useCallback(async () => {
    setShowOpenDialog(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentFile) {
      setShowSaveDialog(true);
      return;
    }

    const editor = monacoEditorRef.current;
    if (editor) {
      const content = editor.getValue();
      await vfs.write(currentFile, content);
      setModified(false);
    }
  }, [currentFile]);

  const handleSaveAs = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleOpenDialogConfirm = useCallback(async (result: FileDialogResult) => {
    setShowOpenDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      try {
        const content = await vfs.read(filePath, { binary: false }) as string;
        const editor = monacoEditorRef.current;
        if (editor) {
          editor.setValue(content);
          setCurrentFile(filePath);
          setModified(false);
          
          // Detect language from file extension
          const ext = filePath.split('.').pop()?.toLowerCase();
          const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'json': 'json',
            'css': 'css',
            'html': 'html',
            'md': 'markdown',
            'py': 'python',
            'rs': 'rust',
            'go': 'go',
          };
          const language = languageMap[ext || ''] || 'plaintext';
          monaco.editor.setModelLanguage(editor.getModel()!, language);
        }
      } catch (error: any) {
        alert(`Error opening file: ${error.message}`);
      }
    }
  }, []);

  const handleSaveDialogConfirm = useCallback(async (result: FileDialogResult) => {
    setShowSaveDialog(false);
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const editor = monacoEditorRef.current;
      if (editor) {
        const content = editor.getValue();
        await vfs.write(filePath, content);
        setCurrentFile(filePath);
        setModified(false);
      }
    }
  }, []);

  return (
    <div className="editor-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '8px' }}>
        <button onClick={handleOpen}>Open</button>
        <button onClick={handleSave} disabled={!currentFile && !modified}>Save</button>
        <button onClick={handleSaveAs}>Save As</button>
        <span style={{ marginLeft: 'auto', color: modified ? 'orange' : 'green' }}>
          {currentFile ? currentFile.split('/').pop() : 'Untitled'}
          {modified ? ' *' : ''}
        </span>
      </div>
      <div ref={editorRef} style={{ flex: 1, width: '100%' }} />
      
      <FileDialog
        open={showOpenDialog}
        mode="open"
        title="Open File"
        filters={[
          { name: 'All Files', extensions: ['*'] },
          { name: 'TypeScript', extensions: ['ts', 'tsx'] },
          { name: 'JavaScript', extensions: ['js', 'jsx'] },
          { name: 'JSON', extensions: ['json'] },
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
          { name: 'All Files', extensions: ['*'] },
          { name: 'TypeScript', extensions: ['ts'] },
          { name: 'JavaScript', extensions: ['js'] },
        ]}
        defaultPath="vfs://documents/"
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleSaveDialogConfirm}
      />
    </div>
  );
};
