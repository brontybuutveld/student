import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaSBOXfgzLXh3p_vGEDTr4r6ymGtH82qA",
  authDomain: "student-7c497.firebaseapp.com",
  databaseURL: "https://student-7c497-default-rtdb.firebaseio.com",
  projectId: "student-7c497",
  storageBucket: "student-7c497.appspot.com",
  messagingSenderId: "392653339134",
  appId: "1:392653339134:web:ea503019708177bafee8af",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
