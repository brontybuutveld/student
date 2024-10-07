import Header from "../components/Header.js";

/** this will be intro page at start of website (user not logged in) */

export default function Home() {
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