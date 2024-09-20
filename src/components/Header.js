export default function Header() {
    return (
        <div style={{borderBottom:'5px solid white', margin: "auto"}}>
            <ol className="breadcrumb">
                <li><a href={"/home"}>Home</a></li>
                <li>-</li>
                <li><a href={"/calendar"}>Calendar</a></li>
                <li>-</li>
                <li><a href={"/chat"}>Chat</a></li>
                <li>-</li>
                <li><a href={"/account"}>Account</a></li>
                <li>-</li>
                <li><a href={"/login"}>Login</a></li>
                <li>-</li>
                <li><a href={"/signup"}>Sign up</a></li>
                <li>-</li>
                <li><a href={"/upload"}>Upload</a></li>
            </ol>
            <h1>YIYAPNP is yet another poorly named project</h1>
        </div>
    )
};