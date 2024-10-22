import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const {
    chatUser,
    messages,
    chatVisible,
    messagesId,
    setMessages,
    userData,
    setChatData,
  } = useContext(AppContext);

  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewType, setPreviewType] = useState(null); // Track whether it's an image or file
  const [previewFileName, setPreviewFileName] = useState(""); // Track file name for file preview
  const [memberAvatars, setMemberAvatars] = useState({}); // Store avatars for group members
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setUserModalOpen] = useState(false); // Track the user modal state

  const toggleUserModal = () => setUserModalOpen((prev) => !prev); // Function to toggle modal

  useEffect(() => {
    // Fetch group member avatars if it's a group chat
    if (chatUser?.isGroup) {
      const groupData = chatUser.groupData;
      if (groupData) {
        const fetchMemberData = async () => {
          const newMemberAvatars = {};

          // Fetch each member's data from Firestore
          const memberPromises = groupData.members.map(async (memberId) => {
            try {
              const memberDoc = await getDoc(doc(db, "users", memberId));
              if (memberDoc.exists()) {
                const memberData = memberDoc.data();
                newMemberAvatars[memberId] = {
                  name: `${memberData.firstName} ${memberData.lastName}`,
                  avatar: memberData.avatar || "/assets/default_avatar.png",
                };
              }
            } catch (error) {
              console.error(
                `Error fetching user data for UID: ${memberId}`,
                error
              );
            }
          });

          await Promise.all(memberPromises); // Wait for all member data to be fetched
          setMemberAvatars(newMemberAvatars); // Update member avatars state
        };

        fetchMemberData();
      }
    }
  }, [chatUser]);

  const sendMessage = async () => {
    if (!input) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (!messagesId) {
      toast.error("No valid chat selected.");
      return;
    }

    if (!chatUser || (!chatUser.rId && !chatUser.isGroup)) {
      toast.error("No valid recipient or group selected.");
      return;
    }

    try {
      // Add a new message to Firestore
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.uid,
          text: input,
          createdAt: new Date(),
        }),
      });

      // Fetch updated messages from Firestore
      const messageDoc = await getDoc(doc(db, "messages", messagesId));
      const allMessages = messageDoc.data()?.messages || [];
      const lastMessage = allMessages[allMessages.length - 1]?.text || input;

      // Update group chat data for all group members if it's a group chat
      if (chatUser.isGroup) {
        const groupRef = doc(db, "groups", chatUser.rId);
        await updateDoc(groupRef, {
          lastMessage,
          updatedAt: new Date(),
        });

        const groupSnapshot = await getDoc(groupRef);
        const groupData = groupSnapshot.data();
        const groupMembers = groupData?.members || [];

        // Update each member's chat data
        const memberPromises = groupMembers.map(async (memberId) => {
          const userChatRef = doc(db, "chats", memberId);
          const userChatSnapshot = await getDoc(userChatRef);
          let chatsData = userChatSnapshot.exists()
            ? userChatSnapshot.data().chatsData || []
            : [];

          const existingGroupChat = chatsData.find(
            (chat) => chat.rId === chatUser.rId && chat.isGroup
          );

          if (existingGroupChat) {
            existingGroupChat.lastMessage = lastMessage;
            existingGroupChat.updatedAt = new Date();
          } else {
            chatsData.push({
              rId: chatUser.rId,
              groupName: chatUser.groupName,
              isGroup: true,
              lastMessage: lastMessage,
              updatedAt: new Date(),
              messageId: messagesId,
            });
          }

          return updateDoc(userChatRef, { chatsData });
        });

        await Promise.all(memberPromises); // Execute updates for all group members
      } else {
        // Handle 1:1 chat updates
        const newChatDataForSender = {
          messageId: messagesId,
          lastMessage,
          rId: chatUser.rId,
          updatedAt: Date.now(),
          messageSeen: true,
        };

        const newChatDataForReceiver = {
          messageId: messagesId,
          lastMessage,
          rId: userData.uid,
          updatedAt: Date.now(),
          messageSeen: false,
        };

        // Fetch chat data for both users
        const senderChatDoc = await getDoc(doc(db, "chats", userData.uid));
        const receiverChatDoc = await getDoc(doc(db, "chats", chatUser.rId));

        let senderChatsData = senderChatDoc.exists()
          ? senderChatDoc.data().chatsData || []
          : [];
        let receiverChatsData = receiverChatDoc.exists()
          ? receiverChatDoc.data().chatsData || []
          : [];

        // Update sender and receiver chat data
        let existingChatForSender = senderChatsData.find(
          (chat) => chat.rId === chatUser.rId
        );
        if (existingChatForSender) {
          existingChatForSender.lastMessage = lastMessage;
          existingChatForSender.updatedAt = Date.now();
        } else {
          senderChatsData.push(newChatDataForSender);
        }

        let existingChatForReceiver = receiverChatsData.find(
          (chat) => chat.rId === userData.uid
        );
        if (existingChatForReceiver) {
          existingChatForReceiver.lastMessage = lastMessage;
          existingChatForReceiver.updatedAt = Date.now();
        } else {
          receiverChatsData.push(newChatDataForReceiver);
        }

        await Promise.all([
          updateDoc(doc(db, "chats", userData.uid), {
            chatsData: senderChatsData,
          }),
          updateDoc(doc(db, "chats", chatUser.rId), {
            chatsData: receiverChatsData,
          }),
        ]);

        setChatData(senderChatsData); // Update sidebar chat list for the sender
      }

      setInput(""); // Clear input after sending the message
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message: " + error.message);
    }
  };

  const sendFile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Upload the file and get the URL
      const fileUrl = await upload(file);

      if (fileUrl && messagesId) {
        // Add the file message to Firestore
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.uid,
            fileName: file.name,
            fileType: file.type,
            fileUrl: fileUrl,
            createdAt: new Date(),
          }),
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file: " + error.message);
    }
  };

  const downloadFile = async (fileUrl, originalFileName) => {
    try {
      const customFileName = prompt(
        "Enter a file name to save:",
        originalFileName || "downloaded_file"
      );
      if (!customFileName) return;

      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = customFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  // Presence tracking logic
  useEffect(() => {
    const setUserOnlineStatus = async (isOnline) => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          online: isOnline,
          lastSeen: serverTimestamp(),
        });
      }
    };

    // Set user online when the component mounts
    setUserOnlineStatus(true);

    // When the window/tab is closed, set the user as offline
    const handleTabClose = () => {
      setUserOnlineStatus(false);
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      setUserOnlineStatus(false);
    };
  }, []);

  // Set up listener for real-time message updates
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => unSub();
    }
  }, [messagesId, setMessages]);

  const handlePreview = (fileUrl, type, fileName) => {
    setPreviewImage(fileUrl);
    setPreviewType(type);
    setPreviewFileName(fileName || "downloaded_file");
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewType(null);
    setPreviewFileName("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    const chatContainer = document.querySelector(".chat-msg");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Check if the chat is a group chat or a 1:1 chat
  const isGroupChat = chatUser?.isGroup;

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      {/* Chat header displaying user or group information */}
      <div className="chat-header">
        <div className="chat-user">
          {chatUser.isGroup ? (
            <>
              {/* Display group avatar and name if it's a group chat */}
              <img
                className="profile-icon"
                src={chatUser.groupAvatar || "/assets/group_avatar.png"}
                alt="Group Avatar"
              />
              <div className="user-info">
                <p className="user-name">
                  {chatUser.groupName || "Group Chat"}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Display user avatar and name for 1-on-1 chat */}
              <img
                className="profile-icon"
                src={chatUser.userData?.avatar || "/assets/default_avatar.png"}
                alt="User Avatar"
              />
              <div className="user-info">
                <p className="user-name">
                  {chatUser.userData
                    ? `${chatUser.userData.firstName} ${chatUser.userData.lastName}`
                    : "User data not available"}
                </p>
                <div className="user-status">
                  {/* Show user's online status or last seen time */}
                  {chatUser.userData?.online ? (
                    <span className="status-dot online"></span>
                  ) : (
                    <>
                      <span className="status-dot offline"></span>
                      <p className="status-text">
                        Last seen{" "}
                        {new Date(
                          chatUser.userData?.lastSeen?.seconds * 1000
                        ).toLocaleTimeString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Display number of users in the group or 1:1 chat */}
        <div className="user-count-container">
          <div className="user-count" onClick={toggleUserModal}>
            <img
              src="/assets/Sample_User_Icon.png"
              alt="Users Icon"
              className="users-icon"
            />
            {chatUser.isGroup ? (
              <p>{chatUser.groupData?.members?.length || 0}</p>
            ) : (
              <p>2</p>
            )}
          </div>
        </div>
      </div>

      {/* Chat message section */}
      <div className="chat-msg">
        {messages.map((msg, index) => {
          let senderAvatar = "/assets/default_avatar.png";
          let senderName = "Unknown User";

          // Handling avatar and name display based on group or 1-on-1 chat
          if (chatUser.isGroup) {
            const memberExists = chatUser.groupData?.members?.includes(msg.sId);
            if (memberExists && memberAvatars[msg.sId]) {
              senderAvatar = memberAvatars[msg.sId].avatar;
              senderName = memberAvatars[msg.sId].name;
            }
          } else if (msg.sId === chatUser.rId) {
            senderAvatar =
              chatUser.userData?.avatar || "/assets/default_avatar.png";
            senderName = `${chatUser.userData?.firstName || "Unknown"} ${
              chatUser.userData?.lastName || ""
            }`;
          } else {
            senderAvatar = userData?.avatar || "/assets/default_avatar.png";
            senderName = `${userData?.firstName || "You"} ${
              userData?.lastName || ""
            }`;
          }

          return (
            // Display each message, distinguishing between sent (r-msg) and received (s-msg) messages
            <div
              key={index}
              className={msg.sId === userData.uid ? "r-msg" : "s-msg"}
            >
              <img
                className="profile-icon"
                src={senderAvatar}
                alt="Profile Icon"
              />
              <div>
                <p className="sender-name">{senderName}</p>
                {/* Display text message */}
                {msg.text && <p className="msg">{msg.text}</p>}
                {/* Display image or file if attached */}
                {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                  <img
                    src={msg.fileUrl}
                    alt="Sent image"
                    className="msg-image"
                    onClick={() => handlePreview(msg.fileUrl, "image")}
                    style={{ cursor: "pointer" }}
                  />
                )}
                {msg.fileUrl && !msg.fileType?.startsWith("image/") && (
                  <div className="file-preview">
                    <img
                      src="/assets/pngtree-file-icon-image_2292647-removebg-preview.png"
                      alt="File icon"
                      className="file-icon-small"
                      onClick={() =>
                        handlePreview(msg.fileUrl, "file", msg.fileName)
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <p className="file-name">{msg.fileName}</p>
                  </div>
                )}
                <p className="msg-time">
                  {new Date(msg.createdAt?.seconds * 1000).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat input field and file upload option */}
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        {/* File upload button */}
        <input onChange={sendFile} type="file" id="file" accept="*" hidden />
        <label htmlFor="file">
          <img
            src="/assets/fileattachments-removebg-preview.png"
            alt="File icon"
          />
        </label>
        {/* Send button */}
        <img
          onClick={sendMessage}
          src="/assets/send_button.png"
          alt="Send button"
        />
      </div>

      {/* Image or file preview modal */}
      {previewImage && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {previewType === "image" ? (
              <img src={previewImage} alt="Preview" className="preview-image" />
            ) : (
              <div className="file-preview-modal">
                <img
                  src="/assets/pngtree-file-icon-image_2292647-removebg-preview.png"
                  alt="File preview"
                  className="file-preview-icon"
                />
                <p>{previewFileName}</p>
              </div>
            )}
            <button
              className="download-btn"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(previewImage, previewFileName);
              }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* Modal for displaying group members */}
      {isUserModalOpen && (
        <div className="user-list-dropdown">
          <ul>
            {chatUser.isGroup
              ? chatUser.groupData?.members?.map((member, index) => (
                  <li key={index}>
                    <img
                      className="profile-icon"
                      src={
                        memberAvatars[member]?.avatar ||
                        "/assets/default_avatar.png"
                      }
                      alt={memberAvatars[member]?.name || "User Avatar"}
                    />
                    <p>{memberAvatars[member]?.name || `User ${index + 1}`}</p>
                  </li>
                ))
              : [userData, chatUser.userData].map((user, index) => (
                  <li key={index}>
                    <img
                      className="profile-icon"
                      src={user?.avatar || "/assets/default_avatar.png"}
                      alt={user?.firstName || "User Avatar"}
                    />
                    <p>{`${user?.firstName || "Unknown"} ${
                      user?.lastName || ""
                    }`}</p>
                  </li>
                ))}
          </ul>
        </div>
      )}
    </div>
  ) : (
    // Default welcome message when no chat is selected
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <p>Click on a user to start chatting!</p>
    </div>
  );
};

export default ChatBox;
