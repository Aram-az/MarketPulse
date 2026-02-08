import { Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./pages/NavBar";
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import StyleGuide from "./pages/StyleGuide";
import AccountCreate from "./pages/accountCreate";
import SettingsPage from "./pages/settingsPage";
import WatchlistPage from "./pages/watchlistPage";
import ChatBotPage from "./pages/ChatBotPage";
import Footer from "./components/Footer";
import HomePage from "./pages/homePage";
import MarketPage from "./pages/marketPage";


function AppLayout() {
  const { pathname } = useLocation();
  const hideNav = pathname === "/login" || pathname === "/account/create";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <NavBar />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/style" element={<StyleGuide />} />
          <Route path="/account/create" element={<AccountCreate />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/chatbot" element={<ChatBotPage />} />
          <Route path="/market" element={<MarketPage />} />
      </Routes>
      </div>

      {!hideNav && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
