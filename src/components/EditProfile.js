import React, { useState } from "react";
import { db, storage } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

export default function EditProfile({ currentUser, userData }) {
  // storage file upload for profile
  async function uploadProfile(file, currentUser, setLoading) {
    try {
      // Reference to the storage path
      const fileRef = ref(storage, `profiles/${currentUser.uid}_${file.name}`);
      setLoading(true);

      // Upload the file
      const snapshot = await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);
      await updateProfile(currentUser, { photoURL });

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { photoURL });

      setLoading(false);
      alert("Profile picture uploaded successfully.");
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
      setLoading(false);
      alert("Failed to upload profile picture.");
    }
  }

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(userData?.bio || ""); // Initialize with current bio

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
      alert("Bio cannot be empty.");
      return;
    }

    // Update bio in user's document
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        bio: bio,
      });
      alert("Bio updated successfully.");
    } catch (error) {
      console.error("Error updating bio: ", error);
      alert("Failed to update bio.");
    }
  }

  return (
    <div className="edit-profile-container">
      <p>Update your avatar</p>
      <input type="file" onChange={handleChange} />
      <button
        disabled={loading || !photo}
        onClick={handleUploadClick}
        className="btn btn-primary"
      >
        Upload profile picture
      </button>

      <div>
        <p>Update your bio</p>
        <input
          className="profile-bio-box"
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={handleBioClick}
          className="btn btn-primary"
        >
          Submit bio
        </button>
      </div>
    </div>
  );
}
