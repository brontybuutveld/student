import Header from "../components/Header.js";
import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import { query, QuerySnapshot } from "firebase/firestore";
import "../chat.css";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar.js";
import ChatBox from "../components/ChatBox/ChatBox.js";
import RightSidebar from "../components/RightSidebar/RightSidebar.js";

const Chat = () => {
  return (
    <>
      <Header />

      {/* Chat componenet */}
      <div className="chat">
        <div className="chat-container">
          <LeftSidebar />
          <ChatBox />
          <RightSidebar />
        </div>
      </div>
    </>
  );
};

export default Chat;
