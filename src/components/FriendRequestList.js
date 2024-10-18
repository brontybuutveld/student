// returns list of currentUser's requests from other users

const FriendRequests = ({ currentUserID }) => {
    const [requests, setRequests] = useState([]);
  
    useEffect(() => {
      const unsubscribe = onSnapshot(doc(db, 'users', currentUserID), (doc) => {
        setRequests(doc.data().requests || []);
      });
  
      return () => unsubscribe();
    }, [currentUserID]);
    
    const acceptRequest = async (friendID) => {
        const userRef = doc(db, 'users', currentUserID);
        const friendRef = doc(db, 'users', friendID);

        // Add friend ID to friend array and removing from request array
        await updateDoc(userRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(friendID),
            requests: firebase.firestore.FieldValue.arrayRemove(friendID),
        })

        // Add currentUserID to friend's friend array
        await updateDoc(friendRef, {
          friends: firebase.firestore.FieldValue.arrayUnion(currentUserID),
        })
    }

    return (
      <>
        {/** return list of requests */}
        

      </>
    )

}