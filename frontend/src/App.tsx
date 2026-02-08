import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./pages/NavBar";
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import StyleGuide from "./pages/StyleGuide";
import AccountCreate from "./pages/accountCreate";
import SettingsPage from "./pages/settingsPage";
import WatchlistPage from "./pages/watchlistPage";
import ChatBotPage from "./pages/ChatBotPage";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account/create" element={<AccountCreate />} />

          <Route path="/style" element={<StyleGuide />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/chatbot" element={<ChatBotPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
