import React, { useState } from "react";

function NotesApp() {
  // State to store the notes
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editIndex, setEditIndex] = useState(null); // For editing a note

  // Function to handle creating or updating a note
  const handleSaveNote = () => {
    if (editIndex !== null) {
      // Editing an existing note
      const updatedNotes = [...notes];
      updatedNotes[editIndex] = { title, content };
      setNotes(updatedNotes);
      setEditIndex(null);
    } else {
      // Creating a new note
      setNotes([...notes, { title, content }]);
    }
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h1>Sticky Notes App</h1>

      {/* Form to create or edit a note */}
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSaveNote}>
        {editIndex !== null ? "Update Note" : "Create Note"}
      </button>

      {/* Notes grid */}
      <div className="notes-grid">
        {notes.map((note, index) => (
          <div key={index} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}