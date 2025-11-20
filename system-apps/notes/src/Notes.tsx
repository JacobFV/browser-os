import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Pin, PinOff, Palette, X } from 'lucide-react';
import './Notes.css';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const COLORS = [
  { name: 'white', value: '#ffffff' },
  { name: 'yellow', value: '#fff9c4' },
  { name: 'blue', value: '#e3f2fd' },
  { name: 'green', value: '#e8f5e9' },
  { name: 'pink', value: '#fce4ec' },
  { name: 'purple', value: '#f3e5f5' },
  { name: 'orange', value: '#fff3e0' },
];

export const Notes: React.FC<{ os: any }> = ({ os }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (editingId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingId]);

  const loadNotes = async () => {
    try {
      if (os?.fs) {
        const notesDir = '/home/user/Documents/Notes';
        try {
          await os.fs.mkdir(notesDir, { recursive: true });
          const files = await os.fs.readdir(notesDir);
          const loaded: Note[] = [];
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              try {
                const data = await os.fs.read(`${notesDir}/${file}`);
                const note = JSON.parse(data);
                loaded.push(note);
              } catch (err) {
                console.error(`Error loading note ${file}:`, err);
              }
            }
          }
          
          setNotes(loaded.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.updatedAt - a.updatedAt;
          }));
        } catch (err) {
          console.log('Notes directory does not exist yet');
        }
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const saveNote = async (note: Note) => {
    try {
      if (os?.fs) {
        const notesDir = '/home/user/Documents/Notes';
        await os.fs.mkdir(notesDir, { recursive: true });
        await os.fs.write(`${notesDir}/${note.id}.json`, JSON.stringify(note, null, 2));
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const createNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      color: 'white',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setEditingId(newNote.id);
    setEditingTitle('');
    setEditingContent('');
    saveNote(newNote);
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const saveEditing = () => {
    if (!editingId) return;

    const updatedNote: Note = {
      ...notes.find(n => n.id === editingId)!,
      title: editingTitle,
      content: editingContent,
      updatedAt: Date.now(),
    };

    setNotes(prev => prev.map(n => n.id === editingId ? updatedNote : n));
    saveNote(updatedNote);
    setEditingId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  const deleteNote = async (id: string) => {
    try {
      if (os?.fs) {
        const notesDir = '/home/user/Documents/Notes';
        await os.fs.write(`${notesDir}/${id}.json`, '');
        // Note: In a real implementation, you'd use fs.unlink or similar
      }
      
      setNotes(prev => prev.filter(n => n.id !== id));
      if (editingId === id) {
        cancelEditing();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const togglePin = (id: string) => {
    const updatedNote: Note = {
      ...notes.find(n => n.id === id)!,
      pinned: !notes.find(n => n.id === id)!.pinned,
      updatedAt: Date.now(),
    };

    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? updatedNote : n);
      return updated.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
    });
    saveNote(updatedNote);
  };

  const changeColor = (id: string, color: string) => {
    const updatedNote: Note = {
      ...notes.find(n => n.id === id)!,
      color,
      updatedAt: Date.now(),
    };

    setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
    saveNote(updatedNote);
    setColorPickerId(null);
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notes-app">
      <div className="notes-header">
        <div className="notes-title">Notes</div>
        <div className="notes-actions">
          <button className="header-btn" onClick={createNote}>
            <Plus size={18} />
            New Note
          </button>
        </div>
      </div>

      <div className="notes-content">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
            <div className="empty-state-hint">
              {searchQuery ? 'Try a different search term' : 'Click "New Note" to create your first note'}
            </div>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => {
              const isEditing = editingId === note.id;
              
              return (
                <div
                  key={note.id}
                  className={`note-card ${note.color} ${note.pinned ? 'pinned' : ''} ${isEditing ? 'editing' : ''}`}
                >
                  <div className="note-header">
                    {isEditing ? (
                      <input
                        ref={titleInputRef}
                        type="text"
                        className="note-title-input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        placeholder="Title..."
                        onBlur={saveEditing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            contentInputRef.current?.focus();
                          }
                          if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                      />
                    ) : (
                      <div className="note-title" onClick={() => startEditing(note)}>
                        {note.title || 'Untitled Note'}
                      </div>
                    )}
                    <div className="note-actions">
                      <button
                        className="note-action-btn pin"
                        onClick={() => togglePin(note.id)}
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        {note.pinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
                      </button>
                      <button
                        className="note-action-btn"
                        onClick={() => setColorPickerId(colorPickerId === note.id ? null : note.id)}
                        title="Change color"
                      >
                        <Palette size={16} />
                      </button>
                      <button
                        className="note-action-btn delete"
                        onClick={() => deleteNote(note.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {colorPickerId === note.id && (
                    <div className="color-picker">
                      {COLORS.map(color => (
                        <div
                          key={color.name}
                          className={`color-option ${note.color === color.name ? 'selected' : ''}`}
                          style={{ background: color.value }}
                          onClick={() => changeColor(note.id, color.name)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}

                  {isEditing ? (
                    <textarea
                      ref={contentInputRef}
                      className="note-content-input"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      placeholder="Start typing..."
                      onBlur={saveEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                    />
                  ) : (
                    <div className="note-content" onClick={() => startEditing(note)}>
                      {note.content || 'No content'}
                    </div>
                  )}

                  <div className="note-footer">
                    <div className="note-date">{formatDate(note.updatedAt)}</div>
                    <div className="note-color" style={{ background: COLORS.find(c => c.name === note.color)?.value || '#ffffff' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

