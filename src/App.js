import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import CalendarPage from "./pages/CalendarPage";
import Chat from './pages/Chat';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserProfile from "./pages/UserProfile";
import UserHome from "./pages/UserHome";
import Upload from "./pages/Upload";
import SearchProfile from "./pages/SearchProfile";
import  StickyNote  from "./components/Theme_StickyNote/StickyNote";

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/notes" element={<StickyNote />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/profile/:userid" element={<UserProfile />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/navpage" element={<UserHome />} />
                    <Route path="/searchprofile" element={<SearchProfile />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;