import "../index.css";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const links = [
  { label: "ChatBot", href: "/chatbot" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Markets", href: "/markets" },
  { label: "Portfolio", href: "/portfolio" },
];

const NavBar = () => {
  return (
    <header className="siteHeader">
      <nav className="siteNav">
        <a className="siteNav_logo" href="/">
          <img src="/logo.svg" alt="Logo" width={60} height={60} />
        </a>

        <ul className="navbar">
          {links.map((link) => (
            <li key={link.label} className="navbar_item">
              <a className="navbar_link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <Link to="/login">
          <Button>Login</Button>
        </Link>

        <div className="siteNav_spacer" />
      </nav>
    </header>
  );
};

export default NavBar;
