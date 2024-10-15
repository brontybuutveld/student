import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged , updateProfile } from "firebase/auth";
import { getStorage, uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";

// change later

  const firebaseConfig = {
    apiKey: "AIzaSyDMB1vuWHk0BkeYvoSg6oQI7bJBN8F99bg",
    authDomain: "student-7c497.firebaseapp.com",
    databaseURL: "https://student-7c497-default-rtdb.firebaseio.com",
    projectId: "student-7c497",
    storageBucket: "student-7c497.appspot.com",
    messagingSenderId: "392653339134",
    appId: "1:392653339134:web:ea503019708177bafee8af"
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

// storage file upload
export async function uploadProfile(file, currentUser, setLoading) {
  // reference to file
  const fileRef = ref(storage, `profiles/${currentUser.uid}${file.name}`);
  setLoading(true);
  const snapshot = await uploadBytes(fileRef, file);

  const photoURL = await getDownloadURL(fileRef);

  updateProfile(currentUser, {photoURL: photoURL});

  setLoading(false);
  alert("File succefully uploaded.");
}
