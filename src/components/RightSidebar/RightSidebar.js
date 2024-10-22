import React, { useContext } from "react";
import "./RightSidebar.css";
import { AppContext } from "../../context/AppContext";

const RightSidebar = () => {
  const { userData } = useContext(AppContext); // Grab user data from the app context

  if (!userData) {
    return <p>Loading...</p>; // Show a simple loading message until user data is ready
  }

  return (
    <div className="rs">
      <div className="rs-profile">
        {/* Display user's avatar, fallback to default if no avatar is available */}
        <img
          src={userData.photoURL || "/assets/default_avatar.png"}
          alt="Profile Icon"
          className="profile-pic"
        />
        <h3>
          {userData.firstName} {userData.lastName}
          {/* Green dot to indicate the user is active */}
          <img
            src="/assets/green_dot.png"
            className="green-dot"
            alt="Active status"
          />
        </h3>
        {/* Display user bio or a default message if none is provided */}
        <p>{userData.bio || "Hey, I’m using this chat app!"}</p>
      </div>
    </div>
  );
};

export default RightSidebar;
