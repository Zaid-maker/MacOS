import { Bold, Download, Italic, List, Plus, Search, Trash2, Underline } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

export const Notes: React.FC = () => {
  const { addNotification } = useNotifications();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((note: Note) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }));
    }
    return [
      {
        id: '1',
        title: 'Welcome to Notes',
        content:
          'This is your first note. Click to edit or create a new one!\n\n✨ Features:\n• Auto-save to localStorage\n• Search functionality\n• Export to text file\n• Text formatting helpers',
        timestamp: new Date(),
      },
    ];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      timestamp: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(notes[0] || null);
    }
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, content, timestamp: new Date() } : note)));
  };

  const wrapText = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea || !selectedNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = selectedNote.content.substring(start, end);
    const newText =
      selectedNote.content.substring(0, start) + prefix + selectedText + suffix + selectedNote.content.substring(end);

    updateNote(selectedNote.id, newText);
    setSelectedNote({ ...selectedNote, content: newText });
  };

  const exportNote = () => {
    if (!selectedNote) return;

    const blob = new Blob([selectedNote.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedNote.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    addNotification('Exported', `${selectedNote.title} has been exported`, 'success');
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h3>Notes</h3>
          <button className="notes-new-btn" onClick={createNewNote}>
            <Plus size={18} />
          </button>
        </div>
        <div className="notes-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="notes-search-input"
          />
        </div>
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`notes-list-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="notes-list-item-header">
                <div className="notes-list-item-title">{note.title}</div>
                <button
                  className="notes-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="notes-list-item-preview">{note.content.substring(0, 50)}</div>
              <div className="notes-list-item-time">{note.timestamp.toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="notes-editor">
        {selectedNote ? (
          <>
            <div className="notes-editor-header">
              <input
                type="text"
                className="notes-title-input"
                value={selectedNote.title}
                onChange={(e) => {
                  setNotes(
                    notes.map((note) => (note.id === selectedNote.id ? { ...note, title: e.target.value } : note))
                  );
                  setSelectedNote({ ...selectedNote, title: e.target.value });
                }}
              />
              <button className="notes-export-btn" onClick={exportNote} title="Export Note">
                <Download size={16} />
              </button>
            </div>
            <div className="notes-toolbar">
              <button onClick={() => wrapText('**')} title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => wrapText('*')} title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={() => wrapText('__')} title="Underline">
                <Underline size={16} />
              </button>
              <button onClick={() => wrapText('\n• ', '')} title="Bullet List">
                <List size={16} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="notes-content-input"
              value={selectedNote.content}
              onChange={(e) => {
                updateNote(selectedNote.id, e.target.value);
                setSelectedNote({ ...selectedNote, content: e.target.value });
              }}
              placeholder="Start typing..."
            />
            <div className="notes-footer">Last edited: {selectedNote.timestamp.toLocaleString()}</div>
          </>
        ) : (
          <div className="notes-empty">
            <p>No note selected</p>
          </div>
        )}
      </div>
    </div>
  );
};
