import React, { useContext } from "react";
import "./ChatBox.css";
import { AppContext } from "../../context/AppContext";

const ChatBox = () => {
  const { chatUser, messages, chatVisible } = useContext(AppContext);

  // Log to check if chat user details are available
  console.log("Chat user details:", chatUser);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      {/* Header section showing the user's avatar and name */}
      <div className="chat-user">
        <img
          src={
            chatUser ? chatUser.userData.avatar : "/assets/default_avatar.png"
          }
          alt="User Avatar"
        />
        <p>
          {chatUser
            ? `${chatUser.userData.firstName} ${chatUser.userData.lastName}`
            : "No User Selected"}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src="/assets/green_dot.png" alt="" />
          ) : null}
        </p>
      </div>

      {/* Messages section displaying the conversation */}
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === chatUser.rId ? "r-msg" : "s-msg"}
          >
            <p className="msg">{msg.text}</p>
            <div>
              <img
                src={
                  msg.sId === chatUser.rId
                    ? chatUser.userData.avatar
                    : "/assets/default_avatar.png"
                }
                alt="Profile Icon"
              />
              <p>{new Date(msg.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input section for sending new messages */}
      <div className="chat-input">
        <input type="text" placeholder="Send a message" />
        <input type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src="/assets/gallery_icon.png" alt="Gallery icon" />
        </label>
        <img src="/assets/send_button.png" alt="Send button" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      {/* Display a message if no chat is selected */}
      <p>Click on a user to start chatting!</p>
    </div>
  );
};

export default ChatBox;
