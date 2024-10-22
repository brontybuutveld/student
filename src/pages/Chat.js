import React, { useEffect, useContext, useState } from "react";
import "../chat.css";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import ChatBox from "../components/ChatBox/ChatBox";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Chat = () => {
  const { userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
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
