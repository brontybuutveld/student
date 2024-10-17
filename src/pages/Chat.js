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
  const { userData, setUserData } = useContext(AppContext); // Access user data
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { chatData, usersData } = useContext(AppContext);

  // Stop loading when chat data and user data are available
  useEffect(() => {
    if (chatData && usersData) {
      setLoading(false);
    }
  }, [chatData, usersData]);

  // Firebase Auth listener for user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            console.log("Fetched userData:", userData); // Add this log to see fetched user data in the console
            setUserData({ ...user, ...userData });
            setLoading(false); // Stop loading once data is fetched
          } else {
            navigate("/login"); // Redirect if no user data found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        navigate("/login"); // Redirect if not authenticated
      }
    });

    return () => unsubscribe();
  }, [setUserData, navigate]);

  // Show loading spinner until data is ready
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
