import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
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
  const [previewType, setPreviewType] = useState(null); // Track whether its an image or file
  const [previewFileName, setPreviewFileName] = useState(""); // Track file name for file preview

  const sendMessage = async () => {
    if (!input) {
      console.error("No input found");
      return;
    }

    try {
      if (input && messagesId) {
        console.log("Attempting to send message:", input);
        console.log("Message ID:", messagesId);

        // Add a new message to the messages array in Firestore
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.uid,
            text: input,
            createdAt: new Date(),
          }),
        });

        console.log("Message sent:", input);

        // Fetch updated messages from Firestore
        const messageDoc = await getDoc(doc(db, "messages", messagesId));
        const allMessages = messageDoc.data()?.messages || [];

        // Get the actual last message from the conversation
        const lastMessage = allMessages[allMessages.length - 1]?.text || input;

        // Prepare updated chat data for both sender and receiver
        const newChatDataForSender = {
          messageId: messagesId,
          lastMessage: lastMessage,
          rId: chatUser.rId,
          updatedAt: Date.now(),
          messageSeen: true, // Sender sees the message
        };

        const newChatDataForReceiver = {
          messageId: messagesId,
          lastMessage: lastMessage,
          rId: userData.uid,
          updatedAt: Date.now(),
          messageSeen: false, // Receiver hasnt seen it yet
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

        // Update senders chat data
        let existingChatForSender = senderChatsData.find(
          (chat) => chat.rId === chatUser.rId
        );
        if (existingChatForSender) {
          existingChatForSender.lastMessage = lastMessage;
          existingChatForSender.updatedAt = Date.now();
        } else {
          senderChatsData.push(newChatDataForSender);
        }

        // Update receivers chat data
        let existingChatForReceiver = receiverChatsData.find(
          (chat) => chat.rId === userData.uid
        );
        if (existingChatForReceiver) {
          existingChatForReceiver.lastMessage = lastMessage;
          existingChatForReceiver.updatedAt = Date.now();
        } else {
          receiverChatsData.push(newChatDataForReceiver);
        }

        // Save updated chat data for both users in Firestore
        await Promise.all([
          updateDoc(doc(db, "chats", userData.uid), {
            chatsData: senderChatsData,
          }),
          updateDoc(doc(db, "chats", chatUser.rId), {
            chatsData: receiverChatsData,
          }),
        ]);

        // Update chat list in the sidebar for the sender
        setChatData(senderChatsData);

        // Clear input after sending the message
        setInput("");
      }
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
            fileName: file.name, // Store file name
            fileType: file.type, // Store file type image/png or application/pdf
            fileUrl: fileUrl, // URL of the uploaded file
            createdAt: new Date(),
          }),
        });

        console.log("File sent:", fileUrl);
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
      if (!customFileName) {
        // If user cancels or doesnt enter a name exit the function
        return;
      }

      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = customFileName; // Use custom file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  // Set up listener for real-time message updates
  useEffect(() => {
    if (messagesId) {
      console.log("Setting up message listener for messagesId:", messagesId);
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
        console.log("Received new messages:", res.data().messages.reverse());
      });
      return () => {
        console.log("Cleaning up listener for messagesId:", messagesId);
        unSub();
      };
    }
  }, [messagesId, setMessages]);

  const handlePreview = (fileUrl, type, fileName) => {
    setPreviewImage(fileUrl); // Set the clicked file for preview
    setPreviewType(type); // Set the preview type image or file
    setPreviewFileName(fileName || "downloaded_file"); // Set file name
  };

  const closePreview = () => {
    setPreviewImage(null); // Close the preview
    setPreviewType(null); // Clear the preview type
    setPreviewFileName(""); // Clear the file name
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePreview(); // Close preview when Esc key is pressed
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

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      {/* Display the current chat user's avatar and name */}
      <div className="chat-user">
        <img
          src={chatUser.userData.avatar || "/assets/default_avatar.png"}
          alt="User Avatar"
        />
        <p>
          {chatUser.userData.firstName} {chatUser.userData.lastName}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="green-dot" src="/assets/green_dot.png" alt="" />
          ) : null}
        </p>
      </div>

      {/* Display the conversation history */}
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === chatUser.rId ? "r-msg" : "s-msg"}
          >
            <img
              src={
                msg.sId === chatUser.rId
                  ? chatUser.userData.avatar
                  : "/assets/default_avatar.png"
              }
              alt="Profile Icon"
            />
            <div>
              {/* Display text message if it exists */}
              {msg.text && <p className="msg">{msg.text}</p>}

              {/* Display image if it exists and allow preview */}
              {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                <img
                  src={msg.fileUrl}
                  alt="Sent image"
                  className="msg-image"
                  onClick={() => handlePreview(msg.fileUrl, "image")}
                  style={{ cursor: "pointer" }} // Indicate it's clickable
                />
              )}

              {/* Display file if it exists and allow preview */}
              {msg.fileUrl && !msg.fileType?.startsWith("image/") && (
                <div className="file-preview">
                  <img
                    src="/assets/pngtree-file-icon-image_2292647-removebg-preview.png"
                    alt="File icon"
                    className="file-icon-small"
                    onClick={() =>
                      handlePreview(msg.fileUrl, "file", msg.fileName)
                    } // Click to preview files
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
        ))}
      </div>

      {/* Input section to send new messages */}
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input onChange={sendFile} type="file" id="file" accept="*" hidden />
        <label htmlFor="file">
          <img src="/assets/gallery_icon.png" alt="File icon" />
        </label>
        <img
          onClick={sendMessage}
          src="/assets/send_button.png"
          alt="Send button"
        />
      </div>

      {/* Preview Modal for images and files */}
      {previewImage && (
        <div
          className="image-preview-modal"
          onClick={closePreview} // Clicking anywhere outside will close
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Check if preview is for an image or a file */}
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
                downloadFile(previewImage, previewFileName); // Call the download function
              }}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <p>Click on a user to start chatting!</p>
    </div>
  );
};

export default ChatBox;
