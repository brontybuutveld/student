import { createContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null); // Holds chat data for the user
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  // Listen for authentication state changes user login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User logged in:", user.uid); // Log when a user is logged in

        // Fetch user data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({ uid: user.uid, ...userSnap.data() });
          console.log("User data fetched:", userSnap.data()); // Log fetched user data
        } else {
          console.error("No user data found for user:", user.uid);
        }
      } else {
        setUserData(null); // Reset when no user is logged in
        console.log("No user is logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch chat data once userData is available
  useEffect(() => {
    if (userData && userData.uid) {
      console.log("Fetching chat data for user:", userData.uid); // Log fetching chat data

      const chatRef = doc(db, "chats", userData.uid);
      const unsubscribe = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatsData || [];
        console.log("Fetched chat items:", chatItems); // Log fetched chat items

        // Fetch user details for each chat
        const promises = chatItems.map(async (item) => {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          return { ...item, userData: userSnap.data() };
        });

        const result = await Promise.all(promises);
        console.log("Resolved chat data:", result); // Log final chat data with user details
        setChatData(result); // Update chat data state
      });

      return () => unsubscribe();
    }
  }, [userData]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        chatData,
        setChatData,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser,
        chatVisible,
        setChatVisible,
        messages,
        setMessages,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
