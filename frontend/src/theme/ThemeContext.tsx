import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function applyThemeToDom(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  return saved === "dark" || saved === "light" ? saved : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyThemeToDom(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo<ThemeCtx>(() => {
    return {
      theme,
      setTheme: (t) => setThemeState(t),
      toggleTheme: () => setThemeState((cur) => (cur === "dark" ? "light" : "dark")),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
