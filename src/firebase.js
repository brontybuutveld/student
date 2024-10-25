import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { getStorage, uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { getFirestore, getDoc, doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

// Firebase configuration (with environment variables for security)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Custom hook to get the current logged-in user and their data from Firestore
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Get user data from Firestore
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

// Function for uploading profile pictures
export async function uploadProfile(file, currentUser, setLoading) {
  try {
    const fileRef = ref(storage, `profiles/${currentUser.uid}_${file.name}`);
    setLoading(true);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(fileRef, file);

    // Get the download URL for the uploaded file
    const photoURL = await getDownloadURL(fileRef);

    // Update the user's Firebase Auth profile with the new photoURL
    await updateProfile(currentUser, { photoURL });

    // Update the user's document in Firestore with the avatar URL
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      avatar: photoURL,
    });

    setLoading(false);
    alert("Profile picture uploaded successfully.");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    setLoading(false);
  }
}

// Function to handle user sign out
export const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out.");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
};
