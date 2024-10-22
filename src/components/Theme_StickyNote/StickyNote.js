import React, { useState } from "react";
import Header from "../Header.js";

export default function NotesApp() {
  // State to store the notes
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editIndex, setEditIndex] = useState(null); // For editing a note

  // Function to edit a note
  const handleEdit = (index) => {
    const noteToEdit = notes[index];
    setTitle(noteToEdit.title);
    setContent(noteToEdit.content);
    setEditIndex(index); // Save the index for updating the note
  };

  // Function to delete a note
  const handleDelete = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

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
    <>
    <Header />
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
      <button onClick={handleSaveNote} className="btn btn-primary">
        {editIndex !== null ? "Update Note" : "Create Note"}
      </button>

      {/* Notes grid */}
      <div className="notes-grid">
        {notes.map((note, index) => (
          <div key={index} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleEdit(index)} className="btn btn-primary">Edit</button>
            <button onClick={() => handleDelete(index)} className="btn btn-primary">Delete</button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
