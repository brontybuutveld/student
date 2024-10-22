import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserProfile from "./pages/UserProfile";
import UserHome from "./pages/UserHome";
import Upload from "./pages/Upload";
import AppContextProvider, { AppContext } from "./context/AppContext";

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppContextProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/" element={<Home />} />
            <Route path="/profile/:userid" element={<UserProfile />} />
            <Route path="/upload" element={<Upload />} />
            {/** for testing */}
            <Route path="/navpage" element={<UserHome />} />
          </Routes>
        </AppContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
