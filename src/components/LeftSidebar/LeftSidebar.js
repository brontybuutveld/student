import React from "react";
import "./LeftSidebar.css";

const LeftSidebar = () => {
  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          {/* will insert later*/}
          <div className="menu">
            <img
              src="/assets/menu_icon.png"
              alt="Menu Icon"
              className="menu-icon"
            />
          </div>
        </div>
        <div className="ls-search">
          <img
            src="/assets/search_icon.png"
            alt="Search Icon"
            className="search-icon"
          />
          <input type="text" placeholder="Search here.." />
        </div>
      </div>
      <div className="ls-list">
        <div className="friends">
          <img
            src="/assets/profile_martin.png"
            alt="Profile Icon"
            className="profile-icon"
          />
          <div>
            <p>Richard Sanford</p>
            <span>Hello, How are you?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
