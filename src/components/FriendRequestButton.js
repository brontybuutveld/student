import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase"; // Import to get the current user

const FriendRequestButton = ({ requestedUserId }) => {
  const [reqSent, setReqSent] = useState(false); // Track if a request has been sent
  const [isFriend, setIsFriend] = useState(false); // Track if they are friends
  const [requestedUserName, setRequestedUserName] = useState(""); // Store receiver's name

  const { currentUser } = useAuth(); // Get the logged-in user

  // Check if users are already friends
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!currentUser || !requestedUserId) return;

      const friendDoc = await getDoc(doc(db, "friends", currentUser.uid));

      if (friendDoc.exists()) {
        const friendsList = friendDoc.data()?.friends || [];
        if (friendsList.includes(requestedUserId)) {
          setIsFriend(true); // Set friend status
        }
      }

      // Get friends names
      const userDoc = await getDoc(doc(db, "users", requestedUserId));
      if (userDoc.exists()) {
        const { firstName = "Friend" } = userDoc.data();
        const { lastName = "Friend"} = userDoc.data();
        setRequestedUserName(firstName + " " + lastName); // Store the friend's first name
      }
    };

    checkFriendStatus();
  }, [currentUser, requestedUserId]);

  const sendRequest = async () => {
    try {
      const senderId = currentUser?.uid;

      if (!requestedUserId || !senderId) {
        alert("User IDs are missing.");
        return;
      }

      if (reqSent) {
        alert("You have already sent a request.");
        return;
      }

      const friendRef = doc(db, "friends", requestedUserId);

      const friendSnap = await getDoc(friendRef);
      if (!friendSnap.exists()) {
        await setDoc(friendRef, { userId: requestedUserId, requests: [] }, { merge: true });
      }

      await updateDoc(friendRef, {
        requests: arrayUnion(senderId),
      });

      setReqSent(true);
      console.log("Friend request sent successfully.");
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  if (isFriend) {
    return (
      <p>You are friends with {requestedUserName}.</p>
    );
  }

  return (
    <>
      <button
        onClick={sendRequest}
        disabled={reqSent}
        className="btn btn-primary"
      >
        Send Friend Request
      </button>
      {reqSent && <p>Request Sent!</p>}
    </>
  );
};

export default FriendRequestButton;
