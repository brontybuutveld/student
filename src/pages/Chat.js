import React, { useEffect, useContext, useState } from "react";
import "../chat.css";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import ChatBox from "../components/ChatBox/ChatBox";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Chat = () => {
  const { userData } = useContext(AppContext); // Access user data from context
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ensure the user is authenticated and handle loading state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/home"); // Redirect to home if not signed in
      }
    });

    // Stop loading once userData is available
    if (userData) {
      setLoading(false);
    }

    return () => unsubscribe(); // Cleanup listener
  }, [userData, navigate]);

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
