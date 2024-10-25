import React, { useState, useContext } from "react";
import "./CreateGroup.css";
import { AppContext } from "./context/AppContext";
import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

const CreateGroup = ({ closeModal }) => {
  const { userData, setChatData } = useContext(AppContext);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Adds or removes a friend from the selected list when clicked
  const handleFriendSelection = (friend) => {
    setSelectedFriends(
      (prev) =>
        prev.includes(friend)
          ? prev.filter((f) => f !== friend) // Remove friend if already selected
          : [...prev, friend] // Add friend if not selected
    );
  };

  // Search for users by first or last name based on input
  const handleSearch = async (e) => {
    const input = e.target.value.trim();

    if (!input) {
      setSearchResults(selectedFriends); // Show selected friends if search input is cleared
      return;
    }

    const usersRef = collection(db, "users");
    const firstNameQuery = query(usersRef, where("firstName", "==", input));
    const lastNameQuery = query(usersRef, where("lastName", "==", input));

    const [firstNameSnapshot, lastNameSnapshot] = await Promise.all([
      getDocs(firstNameQuery),
      getDocs(lastNameQuery),
    ]);

    const firstNameResults = firstNameSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastNameResults = lastNameSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const combinedResults = [
      ...firstNameResults,
      ...lastNameResults.filter(
        (lastNameResult) =>
          !firstNameResults.some(
            (firstNameResult) => firstNameResult.id === lastNameResult.id
          )
      ),
    ];

    const updatedResults = combinedResults.concat(
      selectedFriends.filter(
        (friend) => !combinedResults.find((result) => result.id === friend.id)
      )
    );

    setSearchResults(updatedResults);
  };

  // Handles the file input for group avatar
  const handleGroupAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupAvatar(file);
    }
  };

  // Main function to create a group and save it to the database
  const createGroup = async () => {
    if (!groupName || selectedFriends.length === 0) {
      toast.error("Group name and at least one friend are required.");
      return;
    }

    try {
      setUploading(true);
      const groupRef = doc(collection(db, "groups"));
      const messageRef = doc(collection(db, "messages"));

      let groupAvatarUrl = "/assets/group_avatar.png"; // Fallback avatar if no image is uploaded

      // Upload group avatar to Firebase Storage if available
      if (groupAvatar) {
        const avatarRef = ref(
          storage,
          `groupAvatars/${groupRef.id}_${Date.now()}`
        );
        const uploadTask = uploadBytesResumable(avatarRef, groupAvatar);

        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            groupAvatarUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          });
        });
      }

      const groupData = {
        groupId: groupRef.id,
        groupName,
        groupAvatar: groupAvatarUrl,
        members: [...selectedFriends.map((f) => f.id), userData.uid], // Add selected friends and current user to the group
        admin: userData.uid, // Set the current user as group admin
        messagesId: messageRef.id,
        messages: [],
      };

      await setDoc(groupRef, groupData);

      await setDoc(messageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const memberPromises = selectedFriends.map((friend) =>
        updateDoc(doc(db, "chats", friend.id), {
          chatsData: arrayUnion({
            rId: groupRef.id,
            groupName,
            isGroup: true,
            groupAvatar: groupAvatarUrl,
            lastMessage: "",
            updatedAt: new Date(),
            messageId: messageRef.id,
          }),
        })
      );

      await updateDoc(doc(db, "chats", userData.uid), {
        chatsData: arrayUnion({
          rId: groupRef.id,
          groupName,
          isGroup: true,
          groupAvatar: groupAvatarUrl,
          lastMessage: "",
          updatedAt: new Date(),
          messageId: messageRef.id,
        }),
      });

      await Promise.all(memberPromises);

      setChatData((prev) => [
        ...prev,
        {
          rId: groupRef.id,
          groupName,
          isGroup: true,
          groupAvatar: groupAvatarUrl,
          lastMessage: "",
          messageId: messageRef.id,
        },
      ]);

      closeModal();
      toast.success("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error); // Log any errors during group creation
      toast.error("Error creating group: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group-modal">
      <div className="modal-content">
        <h3>Create Group</h3>

        {/* Input for the group name */}
        <input
          className="group-input"
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* Input for uploading a group avatar */}
        <input
          type="file"
          accept="image/*"
          onChange={handleGroupAvatarUpload}
        />

        {/* Search bar for finding and adding friends to the group */}
        <input
          className="search-input"
          type="text"
          placeholder="Search users to add..."
          onChange={handleSearch}
        />

        {/* Display search results or selected friends */}
        <div className="friend-list">
          {searchResults.length > 0 ? (
            searchResults.map((friend) => (
              <div key={friend.id} className="friend-item">
                {/* Checkbox to select or deselect friends */}
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend)}
                  onChange={() => handleFriendSelection(friend)}
                />
                <label className="friend-label">
                  {friend.firstName} {friend.lastName}
                </label>
              </div>
            ))
          ) : (
            <p>No friends found</p> // Fallback message if no friends are found
          )}
        </div>

        {/* Button to create the group, disabled while uploading */}
        <button
          className="group-btn"
          onClick={createGroup}
          disabled={uploading}
        >
          {uploading ? "Creating..." : "Create Group"}{" "}
          {/* Change button text while creating */}
        </button>

        {/* Button to cancel and close the modal */}
        <button className="group-btn cancel-btn" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
