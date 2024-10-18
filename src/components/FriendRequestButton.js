import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { useParams } from "react-router-dom";

const FriendRequestButton = ({ requestedUser }) => {
  const { reqSent, setReqSent } = useState(false); // if a friend request has been sent
  const { userid } = useParams(); // current user's id

  const sendRequest = async (friendID) => {
    try {
      // Prevent users from sending mutiple requests
      if (!reqSent) {
        const userRef = doc(db, "users", friendID); // friend user reference
        // Update requests array with id of current user
        await updateDoc(userRef, {
          requests: firebase.firestore.FieldValue.arrayUnion(userid),
        });
      } else {
        alert("You have already sent a request.");
      }
    } catch (err) {
      console.error("Failed sending request");
    } finally {
      console.log("Request successful");
      setReqSent(true);
    }
  };

  return (
    <>
      {/** Button to send friend request */}
      <button
        onClick={() => sendRequest(requestedUser.id)}
        disabled={reqSent}
        className="btn btn-primary"
      >
        Send Friend Request
      </button>
      {/** Text indicating if request has been sent successfully */}
      {reqSent && <p>Request Sent!</p>}
    </>
  );
};

export default FriendRequestButton;
