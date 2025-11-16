import React, { useState, useEffect } from 'react';
import type { FileSystem } from '@browser-os/fs';
import type { FileMetadata } from '@browser-os/schemas';
import { JsonEditor } from './JsonEditor';

export interface OtherSettingsProps {
  fs: FileSystem;
  loading?: boolean;
}

export const OtherSettings: React.FC<OtherSettingsProps> = ({
  fs,
  loading = false,
}) => {
  const [currentDir, setCurrentDir] = useState('/etc');
  const [entries, setEntries] = useState<FileMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDirectory();
  }, [currentDir]);

  const loadDirectory = async () => {
    setLoadingFiles(true);
    setError(null);
    try {
      if (!(await fs.exists(currentDir))) {
        await fs.mkdir(currentDir, { recursive: true });
      }

      const dirEntries = await fs.readdir(currentDir);
      const metadataPromises = dirEntries.map(async (name: string) => {
        const fullPath = currentDir === '/' ? `/${name}` : `${currentDir}/${name}`;
        try {
          return await fs.stat(fullPath);
        } catch {
          return null;
        }
      });

      const metadataResults = await Promise.all(metadataPromises);
      const validEntries = metadataResults.filter((m: FileMetadata | null): m is FileMetadata => m !== null);
      setEntries(validEntries.sort((a: FileMetadata, b: FileMetadata) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.path.localeCompare(b.path);
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileClick = async (path: string) => {
    if (!path.endsWith('.json')) {
      alert('Only JSON files can be edited');
      return;
    }

    setLoadingFiles(true);
    setError(null);
    try {
      const data = await fs.read(path);
      const content = new TextDecoder().decode(data);
      setFileContent(content);
      setSelectedFile(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDirectoryClick = (path: string) => {
    setCurrentDir(path);
    setSelectedFile(null);
    setFileContent('');
  };

  const handleParentClick = () => {
    if (currentDir === '/') return;
    const parts = currentDir.split('/').filter((p) => p);
    parts.pop();
    setCurrentDir(parts.length === 0 ? '/' : '/' + parts.join('/'));
    setSelectedFile(null);
    setFileContent('');
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate JSON
      JSON.parse(fileContent);
      const data = new TextEncoder().encode(fileContent);
      await fs.write(selectedFile, data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON or failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h3 className="settings-panel-title">Other Config Files</h3>
      <div className="other-settings">
        <div className="other-settings-browser">
          <div className="other-settings-path">
            <button className="settings-button-small" onClick={handleParentClick} disabled={currentDir === '/'}>
              ↑ Up
            </button>
            <span className="other-settings-current-path">{currentDir}</span>
          </div>
          <div className="other-settings-list">
            {loadingFiles ? (
              <div className="other-settings-loading">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="other-settings-empty">Empty directory</div>
            ) : (
              entries.map((entry) => {
                const name = entry.path.split('/').pop() || entry.path;
                return (
                  <div
                    key={entry.path}
                    className={`other-settings-item ${entry.type} ${selectedFile === entry.path ? 'selected' : ''}`}
                    onClick={() => {
                      if (entry.type === 'directory') {
                        handleDirectoryClick(entry.path);
                      } else if (entry.path.endsWith('.json')) {
                        handleFileClick(entry.path);
                      }
                    }}
                  >
                    <span className="other-settings-icon">
                      {entry.type === 'directory' ? '📁' : '📄'}
                    </span>
                    <span className="other-settings-name">{name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="other-settings-editor">
          {selectedFile ? (
            <>
              <div className="other-settings-file-header">
                <span className="other-settings-file-name">{selectedFile}</span>
              </div>
              <JsonEditor value={fileContent} onChange={setFileContent} error={error} />
              {error && <div className="settings-form-error">{error}</div>}
              {success && <div className="settings-form-success">File saved successfully!</div>}
              <div className="settings-form-actions">
                <button
                  className="settings-button primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <div className="other-settings-placeholder">
              Select a JSON file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

