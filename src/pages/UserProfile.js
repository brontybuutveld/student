// pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, useAuth } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header.js';
import EditProfile from '../components/EditProfile';

export default function UserProfile() {
  const { currentUser, userData } = useAuth();
  const { userid } = useParams();

  // States
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    level: ''
  });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [photoURL, setPhotoURL] = useState("https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541");
  const [userLoading, setUserLoading] = useState(true); // Added loading state for currentUser

  // Fetch the user profile when the component loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setUserLoading(true);
        return;
      }

      setUserLoading(false);

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
        // Get another user's profile
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

  // Update the profile picture URL
  useEffect(() => {
    if (!userLoading && currentUser && currentUser.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser, userLoading]);

  // Render a loading spinner while fetching user data
  if (userLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
      <Header />
      <div className='profile-container'>
        <h2>Profile</h2>
        <img src={photoURL} className='avatar' alt='Profile Avatar' />
        <h3>{user.firstName} {user.lastName}</h3>
        <p>{user.email}</p>
        <p>{user.bio}</p>
        <p>Level: {user.level}</p>
      </div>

      {/** If other user AND logged in */}
      {currentUser && !isCurrentUser && (
        <div>
          <button>Follow</button>
          <button>Message</button>
          <button>Give a level</button>
        </div>
      )}

      {/** If current user is viewing their own profile */}
      {isCurrentUser && (
        <EditProfile currentUser={currentUser} userData={userData} />
      )}
    </>
  );
}
