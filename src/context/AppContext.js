import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null); // Store user data
  const [chatData, setChatData] = useState(null); // List of user chats
  const [messagesId, setMessagesId] = useState(null); // Current message thread ID
  const [messages, setMessages] = useState([]); // Current chat messages
  const [chatUser, setChatUser] = useState(null); // Currently selected chat user
  const [chatVisible, setChatVisible] = useState(false); // To toggle chat box visibility

  // Fetch chat data when userData is available
  useEffect(() => {
    if (userData && userData.id) {
      const chatRef = doc(db, "chats", userData.id);
      const unsubscribe = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatsData || [];

        // Fetch user data for each chat
        const promises = chatItems.map(async (item) => {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          return { ...item, userData: userSnap.data() };
        });

        const result = await Promise.all(promises);
        setChatData(result); // Set resolved chat data
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
