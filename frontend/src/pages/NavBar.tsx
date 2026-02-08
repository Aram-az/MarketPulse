import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import "../index.css";

const NavBar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { label: t("nav.chatbot"), href: "/chatbot" },
    { label: t("nav.dashboard"), href: "/dashboard" },
    { label: t("nav.news"), href: "/news" },
    { label: t("nav.watchlist"), href: "/watchlist" },
    { label: t("nav.markets"), href: "/market" },
  ];

  return (
    <header className="siteHeader relative z-50">
      <nav className="siteNav flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="siteNav_logo">
          <img src="/logo.svg" alt="Logo" width={50} height={50} />
        </Link>

        {/* Nav Links */}
        <ul className="navbar flex gap-8">
          {links.map((link) => (
            <li key={link.href} className="navbar_item">
              <Link
                className="navbar_link text-sm font-medium text-gray-300 hover:text-white transition-colors"
                to={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC143C] rounded-full ring-2 ring-black" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/20 hover:border-[#DC143C] transition-colors focus:outline-none overflow-hidden"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={18} className="text-gray-300" />
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#111] border border-gray-800 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-white text-sm font-semibold truncate">
                        {user.name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings size={16} /> {t("nav.settings")}
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon size={16} /> {t("nav.dashboard")}
                      </Link>
                    </div>

                    <div className="border-t border-gray-800 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors text-left"
                      >
                        <LogOut size={16} /> {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button>{t("nav.login")}</Button>
            </Link>
          )}
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default NavBar;
