import Header from "../components/Header";
import placeholder from "../components/placeholder.png";

/** this is page shown after users log in */

export default function NavPage() {
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
            <p>description for calendar</p>
          </div>
        </div>

        {/** chat */}
        <div className="navpage-item" onClick={() => window.location.href = "/chat"}>
          <div className="navpage-image">
            <img className="navpage-image" src={placeholder} />
          </div>
          <div>
            <h3>Chat</h3>
            <p>description for chat, very long description that has lots of words. I have even more words now, im a description bla bla.</p>
          </div>
        </div>
        
        {/** other items */}

      </div>
    </>
  );
}
