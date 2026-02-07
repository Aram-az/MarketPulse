import "./index.css";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import AccountCreate from "./pages/AccountCreate";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/style" element={<StyleGuide />} />
      </Routes>
    </>
  );
}
