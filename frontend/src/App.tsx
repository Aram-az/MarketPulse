import "./index.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import NavBar from "./pages/NavBar";
import Login from "./pages/Login";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
