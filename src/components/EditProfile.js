// pages/EditProfile.js
import React, { useState } from 'react';
import { db, uploadProfile } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProfile({ currentUser, userData }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(userData?.bio || ''); // Initialize with current bio

  // Handle profile picture change
  function handleChange(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  }

  // Handle profile picture upload
  function handleUploadClick() {
    uploadProfile(photo, currentUser, setLoading);
  }

  // Handle bio update
  async function handleBioClick() {
    if (!bio.trim()) {
      alert('Bio cannot be empty.');
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        bio: bio,
      });
      alert('Bio updated successfully.');
    } catch (error) {
      console.error("Error updating bio: ", error);
      alert('Failed to update bio.');
    }
  }

  return (
    <div className='edit-profile-container'>
      <p>Update your avatar</p>
      <input type="file" onChange={handleChange} />
      <button disabled={loading || !photo} onClick={handleUploadClick}>Upload profile picture</button>

      <div>
        <p>Update your bio</p>
        <input className="profile-bio-box" type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
        <button disabled={loading} onClick={handleBioClick}>Submit bio</button>
      </div>
    </div>
  );
}
