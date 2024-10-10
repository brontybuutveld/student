import React from "react";
import "./RightSidebar.css";

const RightSidebar = () => {
  return (
    <div className="rs">
      <div className="rs-profile">
        <img
          src="/assets/profile_martin.png"
          alt="Profile Icon"
          className="profile-pic"
        />
        <h3>
          Richard Sandford
          <img
            src="/assets/green_dot.png"
            className="green-dot"
            alt="Active status"
          />
        </h3>
        <p>Hey, it's me Richard using this chat app</p>
      </div>
    </div>
  );
};

export default RightSidebar;
