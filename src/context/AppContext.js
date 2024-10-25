import { createContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for authentication changes (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSnapshot = await getDoc(doc(db, "users", user.uid));
          if (userSnapshot.exists()) {
            setUserData({ uid: user.uid, ...userSnapshot.data() });
          } else {
            // Redirect to login if user data is missing
            if (location.pathname.startsWith("/chat")) {
              navigate("/login");
            }
          }
        } catch (error) {
          if (location.pathname.startsWith("/chat")) {
            navigate("/login");
          }
        }
      } else {
        // Redirect to login if user logs out
        if (location.pathname.startsWith("/chat")) {
          navigate("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUserData, navigate, location]);

  // Fetch chat data when userData is available
  useEffect(() => {
    if (userData && userData.uid) {
      const chatRef = doc(db, "chats", userData.uid);

      const unsubscribe = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatsData || [];

        // Fetch user data for each chat
        const promises = chatItems.map(async (item) => {
          const userSnap = await getDoc(doc(db, "users", item.rId));
          return { ...item, userData: userSnap.data() };
        });

        const result = await Promise.all(promises);
        setChatData(result);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  // Show a loading spinner until authentication is complete
  if (loading) {
    return <div>Loading...</div>;
  }

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
