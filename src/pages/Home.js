import { Routes,Route } from "react-router-dom";
import Header from "../components/Header.js";
import Login from "./Login.js";
import SignUp from "./SignUp.js";

/** this will be intro page at start of website (user not logged in) */
export default function Home() {
    return (
        <>
            <Header/>
            <div className="home home-left">
                <h1>Welcome to YIYAPNP</h1>
                <h2>Your Collaboration app</h2>
                <p>Welcome to your workspace - connect, collaborate and achieve your academic goals efficiently. </p>
                {/** buttons to be placed here */}
                <div className="button-container">
                    <ul>
                        <li><a href={"/login"}>Log in</a></li>
                        <li><a href={"/signup"}>Sign up</a></li>
                    </ul>
                </div>
            </div>
        </>
    )
};