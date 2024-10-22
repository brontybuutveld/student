import React, { useState, useEffect } from "react";
import { Routes,Route } from "react-router-dom";
import { Form, Button, Alert, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuth,  onAuthStateChanged, sendPasswordResetEmail} from "firebase/auth";
import { auth } from "../firebase";
import Header from "../components/Header"
import {Link} from "react-router-dom";  

export default function ForgotPassword() {

  const sendResetEmail = () => {

  const [email, setEmail] = useState("");

    //TODO implement forgot password
    console.log("forgot password COMING SOON!");
    sendPasswordResetEmail (auth, "robinyeetacc@gmail.com")
    .then(function() {
      setEmailSent(true);
      console.log("reset sent");


    })
    .catch(function(error) {
      console.log(error);
    }); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(email);
    sendResetEmail();
    return;
  }

  return(
    <>
    <Header />
    <div className="center-container">
      <Card
        className="p-4 custom-card"
        style={{ maxWidth: "400px", width: "100%" }}
      >
      {emailSent ? (
        <p>boop</p>
      ):(
        <Form onSubmit={handleSubmit}>
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            type="email"
            placeholder="Enter email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />

          <Button
          className="w-100"
          variant="primary"
          type="submit">

          Send Reset Email
          </Button>

        </Form>
        
      )}
      </Card>
    </div>
    </>
  );
  
}
