// components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

const UserProfile = () => {
  const { userid: userid } = useParams();
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the user document from Firestore
        const userDoc = await getDoc(doc(db, "users", userid));

        if (userDoc.exists()) {
          // Set user state to the Firestore data
          const userData = userDoc.data();
          setUser({
            firstName: userData.firstName || 'N/A', // Handle missing fields
            lastName: userData.lastName || 'N/A',
            email: userData.email || 'N/A'
          });
        } else {
          // If the user document doesn't exist, set default values
          setUser({ firstName: 'unknown', lastName: 'unknown', email: 'unknown' });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Set error values in case of an error
        setUser({ firstName: 'error name', lastName: 'error lastname', email: 'error email' });
      }
    };

    // Fetch the user profile whenever `userid` changes
    fetchUserProfile();
  }, [userid]);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserProfile;
