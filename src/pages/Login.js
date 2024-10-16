import {getAuth, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Col, Row } from "react-bootstrap";
import {useState, useEffect} from "react";
import Header from "../components/Header.js";
import {auth, db} from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [validated, setValidated] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [password, setPassword] = useState("");

    const [user, setUser] = useState(null); // Initialize user as null
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");

    const navigate = useNavigate();

    // Prevent signed in users from accessing
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Redirect to home
          navigate("/navpage");
        }
      });
  
      // Cleanup listener
      return () => unsubscribe();
    }, [navigate]);

    //Monitor authentication state
    useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    }, []);

    
    const login = async (event) => {
        event.preventDefault();

        //Form validation
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
          setValidated(true);
          return;
        }

        setIsSignedIn(true);        
       const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          console.log("Signed in as " + user.email)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage)
        });
        
    }
  

return (
    <>
    <Header />
    <h2>Login</h2>
    <div className = "center-container">
      <Card
      className = "login-card"
      style={{ maxWidth: "400px", width: "100%"}}>
      {/*Shows the successfull card after sucessfull registration */}
      {isSignedIn ? (
        <Card.Body>
          <h3 className="mb-4 text-center">Success!</h3>
          <p className="text-center">
            You Have Been Logged In!
          </p>
          <Link to="/Home">
            <div className="text-center">
              <Button variant="primary" type="submit">
                Home
              </Button>
            </div>
          </Link>
        </Card.Body>
      ) : (
        <Card.Body>
          {/*Log in form*/}
          <h3 className="mb-4 text-center">Log In</h3>
          <Form noValidate validated={validated} onSubmit={login}>
            <Row>
              <Col>
                {/*Email input*/}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                  required
                  type="email"
                  value={email}
                  onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(""); //Clear email error on change
                  }}
                  placeholder="Email"
                  isInvalid={!!emailError}/>
                </Form.Group>
                  {/*Password input*/}
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                      <Form.Control
                      required
                      type="password"
                      value={password}
                      onChange={(event) => {
                      const newPassword = event.target.value;
                      setPassword(newPassword);}}
                      placeholder="Password"
                      isInvalid={!!passwordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError || "Please provide a password."}
                      </Form.Control.Feedback>
                  </Form.Group>
                    <p className="text-center">
                      Don't have an account? {" "}
                      <Link to="/SignUp" className="underline-link">
                        Sign Up
                      </Link>
                    </p>
                    <div className="text-center">
                      <Button variant="primary" type="submit">
                        Log In
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body> 
          )}
        </Card>
      </div>
    </>
  );
}
