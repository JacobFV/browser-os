import React, { useState, useEffect, useRef } from 'react';
import { Save, File, Eye, Edit, FileText, Check, X } from 'lucide-react';
import { marked } from 'marked';
import './MarkdownEditor.css';

type ViewMode = 'edit' | 'preview' | 'split';

export const MarkdownEditor: React.FC<{ os: any }> = ({ os }) => {
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isDirty, setIsDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [viewMode]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadFile = async (filePath: string) => {
    try {
      if (os?.fs) {
        const data = await os.fs.read(filePath);
        setContent(data);
        setCurrentFile(filePath);
        setIsDirty(false);
        showStatus('success', `Loaded ${filePath}`);
      }
    } catch (err) {
      console.error('Error loading file:', err);
      showStatus('error', 'Failed to load file');
    }
  };

  const saveFile = async () => {
    if (!currentFile) {
      saveAs();
      return;
    }

    try {
      if (os?.fs) {
        await os.fs.write(currentFile, content);
        setIsDirty(false);
        showStatus('success', `Saved to ${currentFile}`);
      }
    } catch (err) {
      console.error('Error saving file:', err);
      showStatus('error', 'Failed to save file');
    }
  };

  const saveAs = async () => {
    const fileName = prompt('Enter file name:', currentFile || 'untitled.md');
    if (!fileName) return;

    const filePath = fileName.startsWith('/') ? fileName : `/home/user/Documents/${fileName}`;
    try {
      if (os?.fs) {
        await os.fs.write(filePath, content);
        setCurrentFile(filePath);
        setIsDirty(false);
        showStatus('success', `Saved to ${filePath}`);
      }
    } catch (err) {
      console.error('Error saving file:', err);
      showStatus('error', 'Failed to save file');
    }
  };

  const newFile = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to create a new file?')) {
      return;
    }
    setContent('');
    setCurrentFile(null);
    setIsDirty(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const openFile = async () => {
    const filePath = prompt('Enter file path:', '/home/user/Documents/');
    if (!filePath) return;

    await loadFile(filePath);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = before + selectedText + after;
    const newContent = content.substring(0, start) + newText + content.substring(end);

    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const renderPreview = () => {
    try {
      return { __html: marked.parse(content) };
    } catch (err) {
      return { __html: '<p style="color: red;">Error rendering markdown</p>' };
    }
  };

  const getFileName = (): string => {
    if (!currentFile) return 'Untitled';
    return currentFile.split('/').pop() || 'Untitled';
  };

  return (
    <div className="markdown-editor-app">
      <div className="markdown-editor-header">
        <div className="markdown-editor-title">
          <FileText size={16} />
          <span>{getFileName()}</span>
          {isDirty && <span style={{ color: '#ffa500' }}>●</span>}
          {currentFile && (
            <span className="file-path" style={{ fontSize: '11px', marginLeft: '8px' }}>
              {currentFile}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
              title="Edit Mode"
            >
              <Edit size={14} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              <FileText size={14} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Preview Mode"
            >
              <Eye size={14} />
            </button>
          </div>
          <div className="markdown-editor-actions">
            <button className="header-btn secondary" onClick={newFile} title="New File">
              <File size={14} />
              New
            </button>
            <button className="header-btn secondary" onClick={openFile} title="Open File">
              <File size={14} />
              Open
            </button>
            <button className="header-btn" onClick={saveFile} title="Save File">
              <Save size={14} />
              Save
            </button>
            <button className="header-btn secondary" onClick={saveAs} title="Save As">
              <Save size={14} />
              Save As
            </button>
          </div>
          {statusMessage && (
            <div className={`status-message ${statusMessage.type}`}>
              {statusMessage.type === 'success' ? <Check size={12} /> : <X size={12} />}
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>

      <div className="markdown-editor-content">
        {viewMode === 'edit' || viewMode === 'split' ? (
          <div className={`editor-pane ${viewMode === 'split' ? '' : ''}`}>
            <div className="pane-header">
              <Edit size={14} />
              Editor
            </div>
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="# Start writing your markdown here...

## Features
- **Bold** and *italic* text
- Lists and code blocks
- Links and images
- Tables and more!

```javascript
console.log('Hello, Markdown!');
```"
              spellCheck={false}
            />
          </div>
        ) : null}

        {viewMode === 'preview' || viewMode === 'split' ? (
          <div className={`preview-pane ${viewMode === 'split' ? '' : ''}`}>
            <div className="pane-header">
              <Eye size={14} />
              Preview
            </div>
            {content.trim() ? (
              <div
                className="preview-content"
                dangerouslySetInnerHTML={renderPreview()}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">No content to preview</div>
                <div className="empty-state-hint">Start typing in the editor to see the preview</div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

