import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Header from "../components/Header.js";
import { Link } from "react-router-dom";
import { Form, Button, Card, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SignUp() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirst, setRegisterFirst] = useState("");
  const [registerLast, setRegisterLast] = useState("");
  const [user, setUser] = useState(null); // Initialize user as null
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const register = async (event) => {
    event.preventDefault();
    //password strength checker
    if (registerPassword.length < 6) {
      setPasswordError("Please enter more than 6 characters");
      return;
    }

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

      setPasswordError("");

      // //Redirect user to homepage after succesfull registration
      // window.location.href = "home.js";
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="center-container">
        <Card
          className="p-4 custom-card"
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <Card.Body>
            <h3 className="mb-4 text-center">Sign Up</h3>
            <Form onSubmit={register}>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={registerFirst}
                      onChange={(event) => setRegisterFirst(event.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={registerLast}
                      onChange={(event) => setRegisterLast(event.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={registerPassword}
                  onChange={(event) => {
                    const newPassword = event.target.value;
                    setRegisterPassword(newPassword);

                    if (newPassword.length >= 6) {
                      setPasswordError("");
                    } else {
                      setPasswordError("Please enter more then 6 characters");
                    }
                  }}
                />
                {passwordError && (
                  <p style={{ color: "red", fontSize: "0.9em" }}>
                    {passwordError}
                  </p>
                )}
              </Form.Group>

              <p className="text-center">
                Already have an account?{" "}
                <Link to="/login" className="underline-link">
                  Log In
                </Link>
              </p>

              <div className="text-center">
                <Button variant="primary" type="submit">
                  Register
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
