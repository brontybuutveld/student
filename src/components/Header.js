import React, { useState, useEffect } from "react";
import { useAuth, handleSignOut } from "../firebase";

export default function Header() {
  const { currentUser } = useAuth();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (currentUser) {
      setIsCurrentUser(true);
      setPhotoURL(
        currentUser.photoURL ||
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
      );
    } else {
      setIsCurrentUser(false);
    }
  }, [currentUser]);

  return (
    <div className="headerbar">
      <a href="/home">YIYAPNP</a>
      <a href="/home">Home</a>

      {/** if logged out display login/sign up buttons */}
      {!isCurrentUser && (
        <>
          <a className="rightbutton" href="/login">
            Login
          </a>
          <a className="rightbutton" href="/signup">
            Sign up
          </a>
        </>
      )}

      {/** if logged in display profile and sign out */}
      {isCurrentUser && (
        <>
          <a href="/calendar">Calendar</a>
          <a href="/chat">Chat</a>
          <a href="/notes">My notes</a>
          <a href="/upload">My files</a>
          <a className="header-right" href={`/profile/${currentUser.uid}`}>
            <img src={photoURL} alt="avatar" className="mini-avatar" />
          </a>
          {/** not yet implemented */}
          <a className="rightbutton" href="/home" onClick={handleSignOut}>
            Sign out
          </a>
        </>
      )}
    </div>
  );
}
