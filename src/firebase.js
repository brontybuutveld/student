import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";

// do not post this
const firebaseConfig = {
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// will return current logged in user and user data
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null); // Clear userData if no user is logged in
      }
    });
    return unsub;
  }, []);

  return { currentUser, userData };
}

// function for user to sign out
export const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("User signed out.");
    })
    .catch((error) => {
      // An error happened.
      console.error("Error signing out:", error);
    });
};
