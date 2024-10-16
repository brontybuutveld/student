import React, { useState, useEffect } from "react";
import Header from "../Header";
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'; // Add css for snow theme

export function StickyNote() {
  // State to store the notes
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // where sticky note content is held as html
  const [editIndex, setEditIndex] = useState(null);
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      // If text changes
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML); // Capture content as HTML
      });
    }
  }, [quill]);

  // Function to edit a note
  const handleEdit = (index) => {
    const noteToEdit = notes[index];
    setTitle(noteToEdit.title);
    setContent(noteToEdit.content);
    setEditIndex(index); // Save the index for updating the note

    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(noteToEdit.content); // Load content into the editor
    }
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

    // Clear Create note editor
    setTitle("");
    setContent("");
    if (quill) quill.setText('');
  };

  return (
    <>
      <Header />
      <div>
        <h1>Sticky Notes App</h1>

        {/* Form to create or edit a note */}
        <p>{editIndex !== null ? "Update Your Note" : "Create a New Note"}</p>
        <input
          className="notes-input"
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div ref={quillRef} style={{ height: "150px", marginBottom: "20px" }} />

        <button className="btn btn-primary" onClick={handleSaveNote}>
          {editIndex !== null ? "Update Note" : "Create Note"}
        </button>

        {/* Notes grid */}
        <div className="notes-grid">
          {notes.map((note, index) => (
            <div key={index} className="note-card">
              <h3>{note.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
              <button
                className="btn btn-primary notes-button"
                onClick={() => handleEdit(index)}
              >
                Edit
              </button>
              <button
                className="btn btn-primary notes-button"
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
