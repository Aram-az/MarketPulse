import "./index.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./pages/NavBar";
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import StyleGuide from "./pages/StyleGuide";
import AccountCreate from "./pages/accountCreate";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/style" element={<StyleGuide />} />
        <Route path="/account/create" element={<AccountCreate />} />
      </Routes>
    </>
  );
}
