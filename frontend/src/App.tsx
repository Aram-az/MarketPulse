import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import NavBar from "./pages/NavBar";
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import StyleGuide from "./pages/StyleGuide";
import AccountCreate from "./pages/accountCreate";
import SettingsPage from "./pages/settingsPage";
import WatchlistPage from "./pages/watchlistPage";
import ChatBotPage from "./pages/ChatBotPage";
import Footer from "./components/Footer";
import MarketPage from "./pages/marketPage";
import Dashboard from "./pages/Dashboard";
import NewsPage from "./pages/NewsPage";
import BiasDetectorPage from "./pages/biasDetectorPage";
import TradeJournal from "./pages/TradeJournal";
import ActionPlan from "./pages/ActionPlan";

import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./i18n";

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
          <Route path="/market" element={<MarketPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/bias" element={<BiasDetectorPage />} />
          <Route
            path="/action-plan"
            element={
              <ProtectedRoute>
                <ActionPlan />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Added Trade Journal Route */}
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <TradeJournal />
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
      {/* DataProvider must be INSIDE AuthProvider so it can persist per-session if needed */}
      <DataProvider>
        <AppLayout />
      </DataProvider>
    </AuthProvider>
  );
}
