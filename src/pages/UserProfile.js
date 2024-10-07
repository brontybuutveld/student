// pages/UserProfile.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, useAuth } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import Header from "../components/Header.js";
import EditProfile from "../components/EditProfile";
import Level from "../components/Level.js";

export default function UserProfile() {
  const { currentUser, userData } = useAuth();
  const { userid } = useParams();

  // UseState
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    level: "",
  });

  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [photoURL, setPhotoURL] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
  );
  const [userLoading, setUserLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showLevel, setShowLevel] = useState(false);

  const handleEditProfileToggle = () => {
    setShowProfileEdit((prev) => !prev);
  };

  const handleLevelToggle = () => {
    setShowLevel((prev) => !prev);
  };
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
          firstName: userData.firstName || "N/A",
          lastName: userData.lastName || "N/A",
          email: userData.email || "N/A",
          bio: userData.bio || "No bio available",
          level: userData.level || "Unknown",
        });
        setIsCurrentUser(true);
      } else {
        // Get another user's profile
        const userDoc = await getDoc(doc(db, "users", userid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            firstName: userData.firstName || "N/A",
            lastName: userData.lastName || "N/A",
            email: userData.email || "N/A",
            bio: userData.bio || "No bio available",
            level: userData.level || "Unknown",
          });
        } else {
          setUser({
            firstName: "unknown",
            lastName: "unknown",
            email: "unknown",
            bio: "",
            level: "",
          });
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

  // if loading
  if (userLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
      <Header />

      <div className="profile-container">
        <div className="profile-main-box">
          <div className="profile-box">
            <div className="profile-top">
              <img src={photoURL} className="avatar" alt="Profile Avatar" />
              <h3>
                {user.firstName} {user.lastName}
              </h3>
            </div>
            <div className="profile-info">
              <p>{user.email}</p>
              <p>Level {user.level}</p>
            </div>

            <div className="profile-info">
              <p>{user.bio}</p>
            </div>
          </div>

          {/** If other user AND logged in */}
          <div className="profile-button-box">
            {currentUser && !isCurrentUser && (
              <>
                <button className="btn btn-primary profile-button">
                  Follow
                </button>
                <button className="btn btn-primary profile-button">
                  Message
                </button>
                <button
                  className="btn btn-primary profile-button"
                  onClick={handleLevelToggle}
                >
                  Give a level
                </button>
                {showLevel && <Level userId={userid} />}
              </>
            )}

            {/** If current user is viewing their own profile */}
            {isCurrentUser && (
              <>
                <button
                  className="btn btn-primary profile-button"
                  onClick={handleEditProfileToggle}
                >
                  {showProfileEdit ? "Hide Edit Profile" : "Edit Profile"}
                </button>
                {showProfileEdit && (
                  <EditProfile currentUser={currentUser} userData={userData} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
