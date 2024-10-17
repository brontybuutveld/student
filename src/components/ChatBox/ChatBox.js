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

        // Clear input after sending message
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message: " + error.message);
    }
  };

  // Set up listener for real time message updates
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

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      {/* Display the current chat users avatar and name */}
      <div className="chat-user">
        <img
          src={chatUser.userData.avatar || "/assets/default_avatar.png"}
          alt="User Avatar"
        />
        <p>
          {chatUser.userData.firstName} {chatUser.userData.lastName}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img
              className="green-dot"
              src="/assets/green_dot.png"
              alt="Online"
            />
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
              <p className="msg">{msg.text}</p>
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
        <input type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src="/assets/gallery_icon.png" alt="Gallery icon" />
        </label>
        <img
          onClick={sendMessage}
          src="/assets/send_button.png"
          alt="Send button"
        />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      {/* Prompt the user to select a chat if none is active */}
      <p>Click on a user to start chatting!</p>
    </div>
  );
};

export default ChatBox;
