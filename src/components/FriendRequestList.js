import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";

const FriendRequests = ({ currentUserID }) => {
  const [requests, setRequests] = useState([]);
  const [showReq, setShowReq] = useState(false);
  const [emptyReq, setEmptyReq] = useState(false);

  const handleReqToggle = () => {
    setShowReq((prev) => !prev);
  };

  // Listen for changes to the user's friend requests in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "friends", currentUserID), (doc) => {
      const requestData = doc.data()?.requests || [];
      setRequests(requestData);
      setEmptyReq(requestData.length === 0);
    });

    return () => unsubscribe();
  }, [currentUserID]);

  // Accept a friend request and update both users' friend lists
  const acceptRequest = async (friendID) => {
    if (friendID === currentUserID) {
      console.error("Cannot add yourself as a friend.");
      return; // Prevent adding yourself as a friend
    }

    const userRef = doc(db, "friends", currentUserID);
    const friendRef = doc(db, "friends", friendID);

    try {
      // Update the current user's friend list and remove the request
      await updateDoc(userRef, {
        friends: arrayUnion(friendID), // Add the requester to the current user's friends
        requests: arrayRemove(friendID), // Remove the request from the list
      });

      // Update the friend's friend list to include the current user
      await updateDoc(friendRef, {
        friends: arrayUnion(currentUserID),
      });

      console.log("Friend request accepted!");
      // Optionally, remove the accepted friend from the requests state
      setRequests((prevRequests) =>
        prevRequests.filter((id) => id !== friendID)
      );
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  return (
    <div className="requests-box">
      {!emptyReq && (
        <button onClick={handleReqToggle} className="btn btn-primary">
          You have friend requests!
        </button>
      )}
      {showReq && (
        <>
          <h5>Friend Requests</h5>
          <ul>
            {requests.map((requestId) => (
              <li key={requestId}>
                {requestId}
                <button
                  className="btn btn-primary"
                  onClick={() => acceptRequest(requestId)}
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default FriendRequests;
