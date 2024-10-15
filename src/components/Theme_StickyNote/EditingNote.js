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