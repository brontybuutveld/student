import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

// TODO Implement Remember Me, Sign in With Google

const Login = () => {
  // form input variables
  const [inputEmail, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  // validation and statehandling variables
  const [showError, setShowError] = useState(false);
  const [showLoggedIn, setShowLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // Initialize user as null

  // monitor authentication state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleSignOut = async (event) => {
    // TODO implement Signing out
    event.preventDefault();
    auth.signOut().then(() =>{ 
      setUser(null);
      setShowLoggedIn(false);
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // attempt login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword
      );
      setUser(userCredential.user);
      setLoading(false);
      setShowLoggedIn(true);
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setShowError(true);
        setLoading(false);
      }
      return;
    }
  };

  const handleForgotPassword = () => {
    //TODO implement forgot password
    console.log("forgot password COMING SOON!");
  };

  return (
    <div className="center-container">
      <Card
        className="p-4 custom-card"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        {showLoggedIn ? (
        <Card.Body>
          <h3>Sign Out</h3>
          <p>You are signed in as {user.email}</p>
          <Button
          className="w-100"
          variant="primary"
          type="submit"
          onClick={handleSignOut}>
          Sign Out
          </Button>

        </Card.Body>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="h4 mb-2 text-center">Sign In</div>
            {/* ALert */}
            {showError ? (
              <Alert
                className="mb-2"
                variant="danger"
                onClose={() => setShowError(false)}
                dismissible
              >
                Incorrect email or password.
              </Alert>
            ) : (
              <div />
            )}
            <Form.Group className="mb-2" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={inputEmail}
                placeholder="Username"
                onChange={(e) => setInputUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={inputPassword}
                placeholder="Password"
                onChange={(e) => setInputPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="checkbox">
              <Form.Check type="checkbox" label="Remember me" />
            </Form.Group>
            {!loading ? (
              <Button className="w-100" variant="primary" type="submit">
                Log In
              </Button>
            ) : (
              <Button
                className="w-100"
                variant="primary"
                type="submit"
                disabled
              >
                Logging In...
              </Button>
            )}
            <div className="d-grid justify-content-end">
              <Button
                className="text-muted px-0"
                variant="link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Login;
