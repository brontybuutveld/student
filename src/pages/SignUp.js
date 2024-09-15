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
  //Form input state vairables
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registerFirst, setRegisterFirst] = useState("");
  const [registerLast, setRegisterLast] = useState("");

  //Validation and error handling state variables
  const [user, setUser] = useState(null); // Initialize user as null
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [validated, setValidated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  //Monitor authentication state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  //
  const register = async (event) => {
    event.preventDefault();

    //Form validation check
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      return;
    }

    //Password strength checker and confirmation check
    if (registerPassword.length < 6) {
      setPasswordError("Please enter more than 6 characters");
      return;
    }

    //Password match check
    if (registerPassword !== confirmPassword) {
      setConfirmPasswordError("Password do not match");
      return;
    }

    try {
      //Create user with email and pass
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      console.log("User Created: " + userCredential.user);

      // Store additional user information in Firestore (first and last name as well as email)
      // (may be changed) also store bio and level here too
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: registerFirst,
        lastName: registerLast,
        email: registerEmail,
        bio: "No bio available", 
        level: 1, 
      });
      

      setIsRegistered(true); //Flag user as succesfully registered
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use");
      }
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
          {/*Shows the successfull card after sucessfull registration */}
          {isRegistered ? (
            <Card.Body>
              <h3 className="mb-4 text-center">Success!</h3>
              <p className="text-center">
                You have successfully created an account!
              </p>
              <Link to="/login">
                <div className="text-center">
                  <Button variant="primary" type="submit">
                    Go to login
                  </Button>
                </div>
              </Link>
            </Card.Body>
          ) : (
            <Card.Body>
              {/*Sign up form*/}
              <h3 className="mb-4 text-center">Sign Up</h3>
              <Form noValidate validated={validated} onSubmit={register}>
                <Row>
                  <Col>
                    {/*First name input*/}
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={registerFirst}
                        onChange={(event) =>
                          setRegisterFirst(event.target.value)
                        }
                        placeholder="First name"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your first name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    {/*Last name input*/}
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={registerLast}
                        onChange={(event) =>
                          setRegisterLast(event.target.value)
                        }
                        placeholder="Last name"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your last name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/*Email input*/}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    value={registerEmail}
                    onChange={(event) => {
                      setRegisterEmail(event.target.value);
                      setEmailError(""); //Clear email error on change
                    }}
                    placeholder="Email"
                    isInvalid={!!emailError}
                  />
                  <Form.Control.Feedback type="invalid">
                    {emailError || "Please provide a valid email."}
                  </Form.Control.Feedback>
                </Form.Group>

                {/*Password input*/}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    value={registerPassword}
                    onChange={(event) => {
                      const newPassword = event.target.value;
                      setRegisterPassword(newPassword);

                      if (newPassword.length >= 6) {
                        setPasswordError("");
                      } else {
                        setPasswordError("Please enter more than 6 characters");
                      }
                    }}
                    placeholder="Password"
                    isInvalid={!!passwordError}
                  />
                  <Form.Control.Feedback type="invalid">
                    {passwordError || "Please provide a password."}
                  </Form.Control.Feedback>
                </Form.Group>

                {/*Confirm Password input*/}
                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);

                      //Validate if passwords match
                      if (registerPassword !== event.target.value) {
                        setConfirmPasswordError("Passwords do not match");
                      } else {
                        setConfirmPasswordError("");
                      }
                    }}
                    isInvalid={!!confirmPasswordError}
                    placeholder="Confirm Password"
                  />
                  {confirmPasswordError && (
                    <Form.Control.Feedback type="invalid">
                      {confirmPasswordError}
                    </Form.Control.Feedback>
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
          )}
        </Card>
      </div>
    </>
  );
}
