import React, { useContext } from "react";
import "./RightSidebar.css";
import { AppContext } from "../../context/AppContext";
import defaultAvatar from "../../components/images/placeholder.png"; // Assuming placeholder image is in this path

const RightSidebar = () => {
  const { userData } = useContext(AppContext); // Grab user data from the app context

  // Log userData to check if it contains the avatar or photoURL field
  console.log("RightSidebar userData:", userData);

  if (!userData) {
    return <p>Loading...</p>; // Show a simple loading message until user data is ready
  }

  return (
    <div className="rs">
      <div className="rs-profile">
        {/* Display user's avatar or photoURL fallback to default if no avatar/photoURL is available */}
        <img
          src={userData.avatar || userData.photoURL || defaultAvatar} // Use avatar or photoURL, fallback to defaultAvatar
          alt="Profile Icon"
          className="profile-pic"
          onError={(e) => {
            e.target.src = defaultAvatar; // If image fails to load, use the default avatar
          }}
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
