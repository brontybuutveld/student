import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Header from "../components/Header.js";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirst, setRegisterFirst] = useState("");
  const [registerLast, setRegisterLast] = useState("");
  const [user, setUser] = useState(null); // Initialize user as null

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      console.log(userCredential.user);

      // Store additional user information in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: registerFirst,
        lastName: registerLast,
        email: registerEmail,
      });

      // //Redirect user to homepage after succesfull registration
      // window.location.href = "home.js";
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="SignUp">
      <Header />
      <h3>Sign Up</h3>
      <div>
        <input
          placeholder="First"
          onChange={(event) => {
            setRegisterFirst(event.target.value);
          }}
        />
      </div>

      <div>
        <input
          placeholder="Last"
          onChange={(event) => {
            setRegisterLast(event.target.value);
          }}
        />
      </div>

      <div>
        <input
          placeholder="Email..."
          onChange={(event) => {
            setRegisterEmail(event.target.value);
          }}
        />
      </div>

      <div>
        <input
          placeholder="Password..."
          onChange={(event) => {
            setRegisterPassword(event.target.value);
          }}
        />
      </div>
      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>

      <button onClick={register}>Register</button>
    </div>
  );
}
