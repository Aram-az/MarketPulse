import { Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./pages/NavBar";
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import StyleGuide from "./pages/StyleGuide";
import AccountCreate from "./pages/accountCreate";
import SettingsPage from "./pages/settingsPage";
import WatchlistPage from "./pages/watchlistPage";

function AppLayout() {
  const { pathname } = useLocation();
  // Hide navbar on login/signup pages
  const hideNav = pathname === "/login" || pathname === "/account/create";

  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/style" element={<StyleGuide />} />
        <Route path="/account/create" element={<AccountCreate />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />

        {/* 2. Add the Route here */}
        <Route path="/chatbot" element={<ChatBot />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppLayout />;
}
