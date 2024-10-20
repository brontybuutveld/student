import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, useAuth } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import Header from "../components/Header.js";
import EditProfile from "../components/EditProfile";
import Level from "../components/Level.js";
import FriendRequestButton from "../components/FriendRequestButton.js";
import FriendList from "../components/FriendList.js";
import FriendRequests from "../components/FriendRequestList.js";

export default function UserProfile() {
  const copyIcon =
    "https://icon-library.com/images/copy-to-clipboard-icon/copy-to-clipboard-icon-1.jpg";
  const { currentUser, userData } = useAuth(); // Current logged in user
  const { userid } = useParams(); // user id of the profile

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

  // Copy current user's ID
  const copyUID = () => {
    try {
      navigator.clipboard.writeText(userid);
      alert("Copied User's ID to Clipboard.");
    } catch {
      console.log("Copy to clipboard error.");
    }
  };

  // Fetch the user profile when the component loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      setUserLoading(true);

      if (!currentUser) return;

      if (userid === currentUser.uid && userData) {
        // Viewing own profile
        setUser({
          firstName: userData.firstName || "No first name",
          lastName: userData.lastName || "No last name",
          email: userData.email || "No email provided",
          bio: userData.bio || "No bio available",
          level: userData.level || "Unknown",
        });

        setPhotoURL(
          currentUser.photoURL ||
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
        );
        setIsCurrentUser(true);
      } else {
        // Viewing another user's profile
        try {
          const userDoc = await getDoc(doc(db, "users", userid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            setUser({
              firstName: userData.firstName || "Unknown",
              lastName: userData.lastName || "Unknown",
              email: userData.email || "Unknown",
              bio: userData.bio || "Unknown",
              level: userData.level || "Unknown",
            });

            setPhotoURL(
              userData.photoURL ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            );
          } else {
            setUser({ firstName: "Error getting user", email: "" });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }

      setUserLoading(false);
    };

    fetchUserProfile();
  }, [userid, currentUser, userData]);

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

              {/** copy uid to clipboard */}
              <img
                className="profile-copy-icon"
                src={copyIcon}
                onClick={copyUID}
              />
            </div>

            <div className="profile-info">
              <p>{user.email}</p>
              <p>Level {user.level}</p>
            </div>

            <div className="profile-info">
              <p>{user.bio}</p>
            </div>
          </div>

          <div className="profile-button-box">
            {/** If other user AND logged in */}
            {currentUser && !isCurrentUser && (
              <>
                <FriendRequestButton requestedUserId={userid} />

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
                <a className="btn btn-primary" href="/searchprofile">
                  Search for other users
                </a>
                <button
                  className="btn btn-primary"
                  onClick={handleEditProfileToggle}
                >
                  {/** Change display text if edit is open */}
                  {showProfileEdit ? "Hide Edit Profile" : "Edit Profile"}
                </button>
                {showProfileEdit && (
                  <EditProfile currentUser={currentUser} userData={userData} />
                )}
              </>
            )}
          </div>

          {isCurrentUser && (
            <div className="friends-box">
              <FriendList currentUserId={userid} />
              <FriendRequests currentUserID={userid} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
