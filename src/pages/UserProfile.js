// components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, useAuth, uploadProfile } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header.js';

export default function UserProfile() {
  const { currentUser, userData } = useAuth();
  const { userid } = useParams();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    level: ''
  });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  // placeholder image if no image given yet
  const [photoURL, setPhotoURL] = useState("https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userid === currentUser?.uid && userData) {
        // If the current user is viewing their profile
        setUser({
          firstName: userData.firstName || 'N/A',
          lastName: userData.lastName || 'N/A',
          email: userData.email || 'N/A',
          bio: userData.bio || 'No bio available',
          level: userData.level || 'Unknown',
        });
        setIsCurrentUser(true);
      } else {
        // Get another user profile
        const userDoc = await getDoc(doc(db, "users", userid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            firstName: userData.firstName || 'N/A',
            lastName: userData.lastName || 'N/A',
            email: userData.email || 'N/A',
            bio: userData.bio || 'No bio available',
            level: userData.level || 'Unknown',
          });
        } else {
          setUser({ firstName: 'unknown', lastName: 'unknown', email: 'unknown', bio: '', level: '' });
        }
        setIsCurrentUser(false);
      }
    };

    fetchUserProfile();
  }, [userid, currentUser, userData]);

  function handleChange(e) {
    if(e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  function handleUploadClick() {
    // Logic for handling profile picture upload
    console.log('clicked profile upload');
    uploadProfile(photo,currentUser,setLoading);
  }

  // updates photoURL
  useEffect(() => {
    if (currentUser && currentUser.photoURL) {
      setPhotoURL(currentUser.photoURL)
    }
  }, [currentUser]);

  return (
    <>
      <Header />
      <div>
        <h2>User Profile</h2>
        {/** Placeholder image will only be seen if no image is loaded */}
        <img src={photoURL} className='avatar' alt='Profile Avatar' />
        <p>Name: {user.firstName} {user.lastName}</p>
        <p>Email: {user.email}</p>
        <p>Bio: {user.bio}</p>
        <p>Level: {user.level}</p>
      </div>

      {/** If other user and logged in */}
      {currentUser && !isCurrentUser && (
        <div>
          <button>Follow</button>
          <button>Message</button>
        </div>
      )}

      {/** if current user is logged in */}
      {isCurrentUser && (
        <div>
          <input type="file" onChange={handleChange} />
          <button disabled={loading || !photo} onClick={handleUploadClick}>Upload profile picture</button>
        </div>
      )}
    </>
  );
}
