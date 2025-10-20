import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to Notes',
      content: 'This is your first note. Click to edit or create a new one!',
      timestamp: new Date(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);

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
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(notes[0] || null);
    }
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, content, timestamp: new Date() }
        : note
    ));
  };

  return (
    <div className="notes">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h3>Notes</h3>
          <button className="notes-new-btn" onClick={createNewNote}>
            <Plus size={18} />
          </button>
        </div>
        <div className="notes-list">
          {notes.map(note => (
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
              <div className="notes-list-item-preview">
                {note.content.substring(0, 50)}
              </div>
              <div className="notes-list-item-time">
                {note.timestamp.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="notes-editor">
        {selectedNote ? (
          <>
            <input
              type="text"
              className="notes-title-input"
              value={selectedNote.title}
              onChange={(e) => {
                setNotes(notes.map(note =>
                  note.id === selectedNote.id
                    ? { ...note, title: e.target.value }
                    : note
                ));
                setSelectedNote({ ...selectedNote, title: e.target.value });
              }}
            />
            <textarea
              className="notes-content-input"
              value={selectedNote.content}
              onChange={(e) => {
                updateNote(selectedNote.id, e.target.value);
                setSelectedNote({ ...selectedNote, content: e.target.value });
              }}
              placeholder="Start typing..."
            />
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
