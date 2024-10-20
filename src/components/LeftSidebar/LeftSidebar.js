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
  const {
    userData,
    setChatUser,
    setMessagesId,
    setChatVisible,
    chatsData,
    setUser,
    messageId,
  } = useContext(AppContext);
  const [chatList, setChatList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!userData?.uid) {
      console.log("No userData available.");
      return;
    }

    console.log("Fetching chat data for user:", userData.uid);

    const chatsRef = doc(db, "chats", userData.uid);

    // Listen for changes in the users chat data
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.data().chatsData || [];

        console.log("Fetched chat data:", chatsData);

        // Fetch user data for each chat
        const promises = chatsData.map(async (chat) => {
          const userRef = doc(db, "users", chat.rId);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const user = userSnapshot.data();
            console.log(
              `Fetched user data for chat with rId ${chat.rId}:`,
              user
            );
            return {
              ...chat,
              userData: user, // Attach user data to the chat
            };
          } else {
            console.error("User data not found for chat:", chat.rId);
            return null;
          }
        });

        const resolvedChats = await Promise.all(promises);

        // Filter out the logged in users own profile
        const uniqueChats = resolvedChats.filter(
          (chat) => chat && chat.rId !== userData.uid
        );

        setChatList(uniqueChats);
        console.log("Chat list updated:", uniqueChats);
      } else {
        console.log("No chat data found for user:", userData.uid);
        setChatList([]);
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

    console.log("Search results for input:", input, results);

    setSearchResults(results);
  };

  const addChat = async (user) => {
    console.log("Clicked user details:", user);

    if (!user?.id || !userData?.uid) {
      console.error("User or userData ID is missing.");
      return;
    }

    const chatsRef = doc(db, "chats", userData.uid);
    const messagesRef = collection(db, "messages");

    try {
      const userChatsSnapshot = await getDoc(chatsRef);

      // Ensure chatsData exists and is an array
      let userChatsData = userChatsSnapshot.exists()
        ? userChatsSnapshot.data().chatsData || []
        : [];

      // Check if the chat already exists
      let existingChat = userChatsData.find((chat) => chat.rId === user.id);

      let newMessageRef;

      if (existingChat) {
        // Chat already exists use the existing one
        newMessageRef = doc(messagesRef, existingChat.messageId);
        console.log(
          "Using existing chat with messageId:",
          existingChat.messageId
        );

        await updateDoc(newMessageRef, {
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new chat if none exists
        newMessageRef = doc(messagesRef);
        await setDoc(newMessageRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        console.log("Created new chat with messageId:", newMessageRef.id);

        const newChatData = {
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        };

        // Update both users chatsData in Firestore
        await Promise.all([
          setDoc(
            doc(db, "chats", user.id),
            {
              chatsData: arrayUnion({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: userData.uid,
                updatedAt: Date.now(),
                messageSeen: false,
              }),
            },
            { merge: true }
          ),
          setDoc(
            doc(db, "chats", userData.uid),
            { chatsData: arrayUnion(newChatData) },
            { merge: true }
          ),
        ]);
      }

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();

      setChatUser({
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });

      setChatVisible(true);
      setMessagesId(newMessageRef.id);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const setChat = async (item) => {
    console.log("Setting chat for selected chat item:", item);
    setMessagesId(item.messageId);
    setChatUser(item);
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
        {showSearch && searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.id}
              className="friends"
              onClick={() => addChat(user)}
            >
              {/* Ensure the avatar URL is displayed, fallback to default if missing */}
              <img
                src={user.avatar || "/assets/default_avatar.png"}
                alt="User Avatar"
                className="profile-icon"
              />
              <div className="chat-info">
                <p className="chat-name">{`${user.firstName} ${user.lastName}`}</p>
              </div>
            </div>
          ))
        ) : chatList && chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={chat.messageId}
              className="friends"
              onClick={() => setChat(chat)}
            >
              {/* Display the avatar from chat.userData, fallback to default if not available */}
              <img
                src={chat.userData?.avatar || "/assets/default_avatar.png"}
                alt="User Avatar"
                className="profile-icon"
              />
              <div className="chat-info">
                <p className="chat-name">{`${chat.userData.firstName} ${chat.userData.lastName}`}</p>
                <p className="last-message">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No chats found.</p>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
