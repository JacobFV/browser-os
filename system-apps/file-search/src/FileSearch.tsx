import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Folder, File, Image, Video, Music, FileText, FolderOpen, Clock } from 'lucide-react';
import './FileSearch.css';

interface SearchResult {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: number;
  extension?: string;
}

type FileType = 'all' | 'files' | 'folders' | 'images' | 'videos' | 'audio' | 'documents';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'md'];

export const FileSearch: React.FC<{ os: any }> = ({ os }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fileTypes, setFileTypes] = useState<Set<FileType>>(new Set(['all']));
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified'>('name');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fileTypes]);

  const getFileType = (extension: string): FileType => {
    const ext = extension.toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) return 'images';
    if (VIDEO_EXTENSIONS.includes(ext)) return 'videos';
    if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
    if (DOCUMENT_EXTENSIONS.includes(ext)) return 'documents';
    return 'files';
  };

  const getFileIcon = (result: SearchResult) => {
    if (result.type === 'directory') {
      return <Folder size={24} />;
    }

    const ext = result.extension?.toLowerCase() || '';
    if (IMAGE_EXTENSIONS.includes(ext)) return <Image size={24} />;
    if (VIDEO_EXTENSIONS.includes(ext)) return <Video size={24} />;
    if (AUDIO_EXTENSIONS.includes(ext)) return <Music size={24} />;
    if (DOCUMENT_EXTENSIONS.includes(ext)) return <FileText size={24} />;
    return <File size={24} />;
  };

  const getFileIconClass = (result: SearchResult) => {
    if (result.type === 'directory') return 'folder';
    const ext = result.extension?.toLowerCase() || '';
    if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
    if (DOCUMENT_EXTENSIONS.includes(ext)) return 'document';
    return 'file';
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || !os?.fs) return;

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const found: SearchResult[] = [];

    try {
      const searchPaths = ['/home/user', '/etc', '/bin', '/tmp'];
      
      for (const basePath of searchPaths) {
        try {
          await searchDirectory(basePath, query, found);
        } catch (err) {
          // Skip directories that don't exist or can't be accessed
          console.log(`Cannot search ${basePath}:`, err);
        }
      }

      // Filter by file type
      let filtered = found;
      if (!fileTypes.has('all')) {
        filtered = found.filter(result => {
          if (result.type === 'directory') {
            return fileTypes.has('folders');
          }
          const type = getFileType(result.extension || '');
          return fileTypes.has(type);
        });
      }

      // Sort results
      filtered.sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'size') {
          return (b.size || 0) - (a.size || 0);
        }
        if (sortBy === 'modified') {
          return (b.modified || 0) - (a.modified || 0);
        }
        return 0;
      });

      setResults(filtered);
    } catch (err) {
      console.error('Error performing search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const searchDirectory = async (dirPath: string, query: string, found: SearchResult[], depth = 0): Promise<void> => {
    if (depth > 5) return; // Limit recursion depth

    try {
      const entries = await os.fs.readdir(dirPath);
      
      for (const entry of entries) {
        try {
          const fullPath = `${dirPath}/${entry}`;
          
          // Check if name matches query
          if (entry.toLowerCase().includes(query)) {
            try {
              const stats = await os.fs.stat?.(fullPath) || {};
              found.push({
                path: fullPath,
                name: entry,
                type: stats.isDirectory ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime,
                extension: entry.includes('.') ? entry.split('.').pop() : undefined,
              });
            } catch (err) {
              // If stat fails, still add the entry
              found.push({
                path: fullPath,
                name: entry,
                type: 'file',
                extension: entry.includes('.') ? entry.split('.').pop() : undefined,
              });
            }
          }

          // Recursively search subdirectories
          try {
            const stats = await os.fs.stat?.(fullPath);
            if (stats?.isDirectory) {
              await searchDirectory(fullPath, query, found, depth + 1);
            }
          } catch (err) {
            // Skip directories we can't access
          }
        } catch (err) {
          // Skip entries we can't process
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  };

  const toggleFileType = (type: FileType) => {
    const newTypes = new Set(fileTypes);
    if (type === 'all') {
      if (newTypes.has('all')) {
        newTypes.clear();
        newTypes.add('all');
      } else {
        newTypes.clear();
        newTypes.add('all');
      }
    } else {
      newTypes.delete('all');
      if (newTypes.has(type)) {
        newTypes.delete(type);
        if (newTypes.size === 0) {
          newTypes.add('all');
        }
      } else {
        newTypes.add(type);
      }
    }
    setFileTypes(newTypes);
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const openFile = (result: SearchResult) => {
    // Emit event to open file in file browser or appropriate app
    if (os?.events) {
      os.events.emit('file:open', { path: result.path });
    }
  };

  const openInFileBrowser = (result: SearchResult) => {
    const dirPath = result.type === 'directory' ? result.path : result.path.substring(0, result.path.lastIndexOf('/'));
    if (os?.events) {
      os.events.emit('file-browser:open', { path: dirPath });
    }
  };

  return (
    <div className="file-search-app">
      <div className="file-search-header">
        <div className="file-search-title">File Search</div>
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  performSearch();
                }
              }}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <X size={18} />
              </button>
            )}
            <div className="search-actions">
              <button className="search-btn" onClick={performSearch} disabled={!searchQuery.trim() || isSearching}>
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="file-search-content">
        <div className="search-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">File Types</div>
            {(['all', 'files', 'folders', 'images', 'videos', 'audio', 'documents'] as FileType[]).map(type => (
              <div key={type} className="filter-option" onClick={() => toggleFileType(type)}>
                <div className={`filter-checkbox ${fileTypes.has(type) ? 'checked' : ''}`}>
                  {fileTypes.has(type) && <X size={12} color="white" />}
                </div>
                <span className="filter-label">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="search-results">
          <div className="results-header">
            <div className="results-count">
              {isSearching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
            </div>
            <div className="results-sort">
              <span style={{ fontSize: '14px', color: '#666' }}>Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="modified">Modified</option>
              </select>
            </div>
          </div>

          <div className="results-list">
            {isSearching ? (
              <div className="searching-state">
                <div className="searching-spinner" />
                <div className="searching-text">Searching files...</div>
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">
                  {searchQuery ? 'No results found' : 'Start typing to search'}
                </div>
                <div className="empty-state-hint">
                  {searchQuery ? 'Try a different search term' : 'Search for files and folders by name'}
                </div>
              </div>
            ) : (
              results.map((result, index) => (
                <div key={`${result.path}-${index}`} className="result-item" onClick={() => openFile(result)}>
                  <div className={`result-icon ${getFileIconClass(result)}`}>
                    {getFileIcon(result)}
                  </div>
                  <div className="result-content">
                    <div className="result-name">
                      {highlightText(result.name, searchQuery)}
                      {result.extension && (
                        <span className="file-type-badge">{result.extension.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="result-path">{result.path}</div>
                    <div className="result-meta">
                      {result.size !== undefined && (
                        <div className="result-meta-item">
                          <File size={12} />
                          <span>{formatSize(result.size)}</span>
                        </div>
                      )}
                      {result.modified && (
                        <div className="result-meta-item">
                          <Clock size={12} />
                          <span>{formatDate(result.modified)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="result-actions">
                    <button
                      className="result-action-btn open"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFile(result);
                      }}
                      title="Open"
                    >
                      <FolderOpen size={16} />
                    </button>
                    <button
                      className="result-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInFileBrowser(result);
                      }}
                      title="Show in File Browser"
                    >
                      <Folder size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

