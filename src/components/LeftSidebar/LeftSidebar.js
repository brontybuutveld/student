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
import CreateGroup from "../../CreateGroup";
import defaultAvatar from "../../components/images/placeholder.png";

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
  const [showGroupModal, setShowGroupModal] = useState(false);

  const toggleGroupModal = () => {
    setShowGroupModal((prevState) => !prevState);
  };

  useEffect(() => {
    if (!userData?.uid) {
      return;
    }

    const chatsRef = doc(db, "chats", userData.uid);

    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.data().chatsData || [];

        const promises = chatsData.map(async (chat) => {
          if (chat.isGroup) {
            const groupRef = doc(db, "groups", chat.rId);
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
              const group = groupSnapshot.data();
              return {
                ...chat,
                groupData: group,
              };
            } else {
              return null;
            }
          } else {
            const userRef = doc(db, "users", chat.rId);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
              const user = userSnapshot.data();
              return {
                ...chat,
                userData: user,
              };
            } else {
              return null;
            }
          }
        });

        const resolvedChats = await Promise.all(promises);

        // Ensure uniqueness using messageId or rId, then sort by updatedAt
        const uniqueChats = Array.from(
          new Map(
            resolvedChats
              .filter(Boolean)
              .map((chat) => [chat.rId || chat.messageId, chat])
          ).values()
        ).sort((a, b) => {
          const aUpdatedAt = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const bUpdatedAt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return bUpdatedAt - aUpdatedAt; // Descending order (latest at the top)
        });

        setChatList(uniqueChats); // Set only unique and sorted chats
      } else {
        setChatList([]); // No chats available
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

    const usersRef = collection(db, "users");
    const firstNameQuery = query(usersRef, where("firstName", "==", input));
    const searchSnapshot = await getDocs(firstNameQuery);
    const results = searchSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSearchResults(results);
  };

  const addChat = async (user) => {
    if (!user?.id || !userData?.uid) {
      return;
    }

    const chatsRef = doc(db, "chats", userData.uid);
    const messagesRef = collection(db, "messages");

    try {
      const userChatsSnapshot = await getDoc(chatsRef);

      let userChatsData = userChatsSnapshot.exists()
        ? userChatsSnapshot.data().chatsData || []
        : [];

      let existingChat = userChatsData.find((chat) => chat.rId === user.id);

      let newMessageRef;

      if (existingChat) {
        // Update the `updatedAt` timestamp for one-on-one chats when a new message is added
        newMessageRef = doc(messagesRef, existingChat.messageId);
        await updateDoc(newMessageRef, {
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create a new chat if it doesn't exist
        newMessageRef = doc(messagesRef);
        await setDoc(newMessageRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        const newChatData = {
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: serverTimestamp(),
          messageSeen: true,
        };

        // Update the chats for both users
        await Promise.all([
          setDoc(
            doc(db, "chats", user.id),
            {
              chatsData: arrayUnion({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: userData.uid,
                updatedAt: serverTimestamp(), // Make sure to set this here too
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
    } catch (error) {}
  };

  const setChat = async (item) => {
    if (item.isGroup) {
      if (item.groupData?.messagesId) {
        setMessagesId(item.groupData.messagesId);
      }
      setChatUser({
        messageId: item.groupData.messagesId,
        groupName: item.groupData.groupName,
        groupAvatar: item.groupData.groupAvatar || {defaultAvatar},
        rId: item.rId,
        isGroup: true,
        lastMessage: item.lastMessage || "",
      });
    } else {
      setMessagesId(item.messageId);
      setChatUser(item);
    }

    setChatVisible(true);
  };

  return (
    <div className="ls">
      <div className="ls-search">
        {/* Search bar for searching users */}
        <input
          type="text"
          placeholder="Search users..."
          onChange={handleSearch} // Calls the function to search for users
        />
        {/* Button to open the group creation modal */}
        <button className="add-group-btn" onClick={toggleGroupModal}>
          +
        </button>
      </div>

      <div className="ls-list">
        {/* If search is active and results are found, show search results */}
        {showSearch && searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.id}
              className="friends"
              onClick={() => addChat(user)} // Add chat with the selected user
            >
              <img
                src={user.photoURL || {defaultAvatar}}
                alt="User Avatar"
                className="profile-icon"
              />
              <div className="chat-info">
                <p className="chat-name">
                  {`${user.firstName || ""} ${user.lastName || ""}`}{" "}
                  {/* Display user's full name */}
                </p>
              </div>
            </div>
          ))
        ) : chatList && chatList.length > 0 ? (
          /* If no search is happening, display the list of chats */
          chatList.map((chat) => (
            <div
              key={chat.messageId || chat.rId} // Ensure each chat has a unique key
              className="friends"
              onClick={() => setChat(chat)} // Set the clicked chat as active
            >
              <img
                src={
                  chat.isGroup
                    ? chat.groupData?.groupAvatar || {defaultAvatar}
                    : chat.userData?.avatar || {defaultAvatar}
                }
                alt="Chat Avatar"
                className="profile-icon"
              />
              <div className="chat-info">
                {chat.isGroup ? (
                  <>
                    {/* For group chats, show group name and last message */}
                    <p className="chat-name">
                      {chat.groupData?.groupName || "Unnamed Group"}
                    </p>
                    <p className="last-message">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </>
                ) : (
                  <>
                    {/* For one-on-one chats, show user name and last message */}
                    <p className="chat-name">{`${
                      chat.userData?.firstName || ""
                    } ${chat.userData?.lastName || ""}`}</p>
                    <p className="last-message">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          // If no chats are found, show this message
          <p>No chats found.</p>
        )}
      </div>

      {/* Show the group creation modal if it's toggled */}
      {showGroupModal && <CreateGroup closeModal={toggleGroupModal} />}
    </div>
  );
};

export default LeftSidebar;
