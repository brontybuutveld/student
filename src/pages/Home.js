import Header from "../components/Header.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

/** this will be intro page at start of website (user not logged in) */

export default function Home() {
  const navigate = useNavigate();

  // Prevent signed in users from accessing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to user home
        navigate("/navpage");
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <Header />
        <div className="home">
            <div className="home-cont">
          <h1>Welcome to YIYAPNP</h1>
          <h2>Your Collaboration app</h2>
          <p>
            Welcome to your workspace - connect, collaborate and achieve your
            academic goals efficiently.
          </p>
          
            
            <div className="home-buttoncont">
            <div className="button">
              <a href={"/login"}>Log in</a>
            </div>
            <div className="button">
              <a href={"/signup"}>Sign up</a>
            </div>
            <div className="button">
              <a href={"/navpage"}> (temp) navpage</a>
            </div>
          </div>
          </div>
        </div>
    </>
  );
}