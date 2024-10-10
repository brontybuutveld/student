import React from "react";
import "./ChatBox.css";

const ChatBox = () => {
  return (
    <div>
      <div className="chat-box">
        <div className="chat-user">
          <img src="/assets/profile_martin.png" alt="Profile Icon" />
          <p>
            Richard Sandford
            <img
              src="/assets/green_dot.png"
              alt="Active status"
              className="green-dot"
            />
          </p>
          <img src="/assets/help_icon.png" alt="Profile Icon" />
        </div>
      </div>
      <div className="chat-message">
        <div className="s-message">
          <p className="msg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
          <div>
            <img src="/assets/profile_martin.png" alt="Profile Icon" />
            <p>2:30 PM</p>
          </div>
        </div>
        <div className="s-message">
          <img src="/assets/pic1.png" className="pic1-img" alt="" />
          <div>
            <img
              src="/assets/profile_martin.png"
              className="message-img"
              alt="Profile Icon"
            />
            <p>2:30 PM</p>
          </div>
        </div>
        <div className="r-message">
          <p className="msg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
          <div>
            <img src="/assets/profile_martin.png" alt="Profile Icon" />
            <p>2:30 PM</p>
          </div>
        </div>
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Send a message" />
        <input type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img
            src="/assets/gallery_icon.png"
            className="help "
            alt="Gallery icon"
          />
        </label>
        <img src="/assets/send_button.png" alt="Button Icon" />
      </div>
    </div>
  );
};

export default ChatBox;
