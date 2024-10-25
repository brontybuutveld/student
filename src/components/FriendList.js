import React, { useEffect, useState } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

const FriendList = ({ currentUserId }) => {
  const [friends, setFriends] = useState([]); // Stores friend objects with name & ID
  const [hasFriends, setHasFriends] = useState(false);

  // Get friend names from Firestore
  const fetchFriendDetails = async (friendId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', friendId));
      if (userDoc.exists()) {
        const { firstName = "Unknown", lastName = "" } = userDoc.data();
        return { id: friendId, name: `${firstName} ${lastName}` };
      } else {
        return { id: friendId, name: "Unknown User" };
      }
    } catch (error) {
      console.error("Failed to fetch friend details:", error);
      return { id: friendId, name: "Error fetching user" };
    }
  };

  // Remove friend from both users' friend lists
  const handleRemove = async (friend) => {
    const friendRef = doc(db, 'friends', friend.id);
    const currentUserRef = doc(db, 'friends', currentUserId);

    try {
      // Remove from current user list
      await updateDoc(currentUserRef, {
        friends: arrayRemove(friend.id),
      });

      // Remove from other user list
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUserId),
      });

      console.log(`Removed friend: ${friend.name}`);

      // Update state by removing the friend from the list
      setFriends((prevFriends) => prevFriends.filter(f => f.id !== friend.id));
      setHasFriends(friends.length - 1 > 0); // Check if friends still exist
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  // Fetch and listen for changes to the user's friend list
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'friends', currentUserId), async (doc) => {
      const friendIds = doc.data()?.friends || [];
      const filteredFriendIds = friendIds.filter(id => id !== currentUserId); // Exclude current user

      // Fetch details for each friend ID
      const friendDetails = await Promise.all(
        filteredFriendIds.map((id) => fetchFriendDetails(id))
      );

      setFriends(friendDetails);
      setHasFriends(friendDetails.length > 0);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <div>
      <h5>Friends</h5>
      {!hasFriends && <p>You have 0 friends.</p>}
      <ul className="friends-list">
        {friends.map((friend) => (
          <li key={friend.id}>
            <a className="friends-link" href={`/profile/${friend.id}`}>{friend.name}</a>
            <button
              className="btn btn-danger"
              onClick={() => handleRemove(friend)}
            >
              Remove Friend
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
