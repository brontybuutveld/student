import Header from "../components/Header.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "../firebase"; 

export default function CalendarPage() {
    const navigate = useNavigate();

    // Prevent signed out users from accessing
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Redirect to home
          navigate("/home");
        }
      });
  
      // Cleanup listener
      return () => unsubscribe();
    }, [navigate]);

    return (
        <>
            <Header />
            <h2>Calendar</h2>
        </>
    )
};