import "./index.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import HomePage from "./pages/homePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  );
}


