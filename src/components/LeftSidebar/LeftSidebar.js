import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import { AppContext } from "../../context/AppContext";
import { db } from "../../firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const { userData, setChatUser, setMessagesId, setChatVisible } =
    useContext(AppContext);
  const [chatList, setChatList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!userData?.id) return;

    // Listen for changes in the user's chat data
    const chatsRef = doc(db, "chats", userData.id);
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.data().chatsData || [];
        const promises = chatsData.map(async (chat) => {
          const userRef = doc(db, "users", chat.rId);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const user = userSnapshot.data();
            return {
              ...chat,
              userData: user,
            };
          }
          return null;
        });
        const resolvedChats = await Promise.all(promises);
        setChatList(resolvedChats.filter(Boolean)); // Only show valid chats
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const handleSearch = async (e) => {
    const input = e.target.value.trim();
    if (!input) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setShowSearch(true);

    // Search users by first name
    const usersRef = collection(db, "users");
    const firstNameQuery = query(usersRef, where("firstName", "==", input));
    const searchSnapshot = await getDocs(firstNameQuery);
    const results = searchSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSearchResults(results); // Display search results
  };

  const addChat = async (user) => {
    console.log("Clicked user details:", user); // Logging clicked user

    if (!user?.id || !userData?.uid) {
      console.error("User or userData ID is missing.");
      return;
    }

    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messagesRef);

      // Create new chat with an empty message list
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      // Add chat for the selected user
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.uid,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Add chat for the current user
      await updateDoc(doc(chatsRef, userData.uid), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();

      // Set the chat user context after creating the chat
      setChatUser({
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });

      console.log("Setting chat user:", {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });

      setShowSearch(false);

      // Show chat box once the chat is set up
      if (uData && newMessageRef.id) {
        setChatVisible(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="ls">
      <div className="ls-search">
        <input
          type="text"
          placeholder="Search users..."
          onChange={handleSearch}
        />
      </div>
      <div className="ls-list">
        {showSearch && searchResults.length > 0
          ? searchResults.map((user) => (
              <div
                key={user.id}
                className="friends"
                onClick={() => addChat(user)}
              >
                <img
                  src={user.avatar || "/assets/default_avatar.png"}
                  alt="User Avatar"
                  className="profile-icon"
                />
                <div>
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                </div>
              </div>
            ))
          : chatList.map((chat) => (
              <div
                key={chat.rId}
                className="friends"
                onClick={() => setChatUser(chat)}
              >
                <img
                  src={chat.userData.avatar || "/assets/default_avatar.png"}
                  alt="User Avatar"
                  className="profile-icon"
                />
                <div>
                  <p>{chat.userData.name}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
