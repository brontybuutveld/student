export default function Header() {
    return (
        <div className="headerbar">
                <a href={"/home"}>YIYAPNP</a>
                <a href={"/home"}>Home</a>
                <a href={"/calendar"}>Calendar</a>
                <a href={"/chat"}>Chat</a>
                <a href={"/account"}>Account</a>
                <a className="rightbutton" href={"/login"}>Login</a>
                <a className="rightbutton" href={"/signup"}>Sign up</a>
        </div>
    )
};