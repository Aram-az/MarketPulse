import "./index.css";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import NavLayout from "./pages/NavBar";
import AccountCreate from "./pages/AccountCreate";

// inside <Routes> ...




export default function App() {
  return (
    <Routes>
      {/* No navbar here */}
      <Route path="/login" element={<Login />} />
      <Route path="/accountCreate" element={<AccountCreate />} />
      {/* Navbar only for routes nested under this layout */}
      <Route element={<NavLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* later: <Route path="/home" element={<HomePage />} /> */}
      </Route>
    </Routes>
  );
}
