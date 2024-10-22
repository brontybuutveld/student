import Header from "../components/Header";
import calendarIcon from "../components/images/calendar-icon.jpg";
import chatIcon from "../components/images/chat-icon.jpg";
import filesIcon from "../components/images/files-icon.jpg";
import notesIcon from "../components/images/notes-icon.jpg";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";

/** this is only shown when user is logged in */

export default function NavPage() {
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
            <div className="navpage-container">

                {/** Calendar */}
                <div className="navpage-item" onClick={() => window.location.href = "/calendar"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={calendarIcon} alt="Calendar Icon" />
                    </div>
                    <div>
                        <h3>Calendar</h3>
                        <p>Your personal calendar for reminders and staying organised.</p>
                    </div>
                </div>

                {/** Chat */}
                <div className="navpage-item" onClick={() => window.location.href = "/chat"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={chatIcon} alt="Chat Icon" />
                    </div>
                    <div>
                        <h3>Chat</h3>
                        <p>Message and collaborate with other users.</p>
                    </div>
                </div>

                {/** Sticky Notes */}
                <div className="navpage-item" onClick={() => window.location.href = "/notes"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={notesIcon} alt="Notes Icon" />
                    </div>
                    <div>
                        <h3>Sticky notes</h3>
                        <p>A simple note taking tool.</p>
                    </div>
                </div>

                {/** Files */}
                <div className="navpage-item" onClick={() => window.location.href = "/upload"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={filesIcon} alt="Files Icon" />
                    </div>
                    <div>
                        <h3>Your files</h3>
                        <p>Upload and access all your files here.</p>
                    </div>
                </div>

            </div>
        </>
    );
}