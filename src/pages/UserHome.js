import Header from "../components/Header";
import placeholder from "../components/placeholder.png";
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

                {/** calendar */}
                <div className="navpage-item" onClick={() => window.location.href = "/calendar"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={placeholder} />
                    </div>
                    <div>
                        <h3>Calendar</h3>
                        <p>Your personal calendar for reminders and staying organised.</p>
                    </div>
                </div>

                {/** chat */}
                <div className="navpage-item" onClick={() => window.location.href = "/chat"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={placeholder} /> {/** TO REPLACE WITH REAL IMG */}
                    </div>
                    <div>
                        <h3>Chat</h3>
                        <p>Message and collaborate with other users.</p>
                    </div>
                </div>

                {/** notes app (to add) */}
                <div className="navpage-item" onClick={() => window.location.href = "/notes"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={placeholder} />
                    </div>
                    <div>
                        <h3>Sticky notes</h3>
                        <p>A simple note taking tool.</p>
                    </div>
                </div>

                {/** upload */}
                <div className="navpage-item" onClick={() => window.location.href = "/upload"}>
                    <div className="navpage-image">
                        <img className="navpage-image" src={placeholder} />
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