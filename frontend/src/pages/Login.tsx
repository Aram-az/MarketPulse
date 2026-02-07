import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lang = "en" | "fr";

function setDarkMode(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("en");
  const [darkMode, setDarkModeState] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    setDarkMode(false);
    setDarkModeState(false);
  }, []);

  const t = useMemo(() => {
    const en = {
      languageToggle: "Français",
      greeting: "Good morning",
      emailLabel: "Email ID",
      emailPlaceholder: "Enter your email ID",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      show: "Show",
      hide: "Hide",
      forgot: "Forgotten password?",
      remember: "Remember my email ID",
      signIn: "Sign in",
      firstTime: "First time signing in?",
      firstTimeBody:
        "Create your account to access all our online services with a single password.",
      createAccount: "Create your account",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
    };

    const fr = {
      languageToggle: "English",
      greeting: "Bonjour",
      emailLabel: "ID courriel",
      emailPlaceholder: "Entrez votre ID courriel",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      show: "Afficher",
      hide: "Masquer",
      forgot: "Mot de passe oublié?",
      remember: "Se souvenir de mon ID courriel",
      signIn: "Ouvrir une session",
      firstTime: "Première connexion?",
      firstTimeBody:
        "Créez votre compte pour accéder à tous nos services en ligne avec un seul mot de passe.",
      createAccount: "Créer votre compte",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none ring-0 " +
    "placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)] " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 " +
    "dark:focus:shadow-[0_0_0_3px_rgba(255,45,166,0.18)]";

  return (
    <section
      className="min-h-screen bg-[#f7f7f8] text-black dark:bg-[#0b0f14] dark:text-white"
      lang={lang}
    >
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
        {/* Left image */}
        <div className="relative hidden flex-1 lg:block">
          <img
            src="https://cdn6.dissolve.com/p/D430_47_298/D430_47_298_1200.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10 dark:bg-black/30" />
        </div>

        {/* Right form panel */}
        <div className="flex w-full items-start justify-start bg-white px-8 py-10 dark:bg-white/5 lg:w-[520px] lg:px-10">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                {/* Logo pill (same size as AccountCreate) */}
                <div className="h-10 w-28 overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-[#c1c1c1]">
                  <img
                    src="/nb-logo.png"
                    alt="National Bank"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
                  className="cursor-pointer text-sm text-sky-700 underline underline-offset-2 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  {t.languageToggle}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !darkMode;
                    setDarkModeState(next);
                    setDarkMode(next);
                  }}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/80 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                  title="Toggle theme"
                >
                  {t.theme}: {darkMode ? t.dark : t.light}
                </button>
              </div>
            </div>

            <h1 className="mt-10 text-3xl font-semibold">{t.greeting}</h1>

            {/* Form */}
            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/"); // landing page after sign in
              }}
            >
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className={inputClass}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="password">
                  {t.passwordLabel}
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={
                      inputClass.replace("mt-2 ", "").replace("pr-12", "") + " pr-12"
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    aria-pressed={showPw}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                    title={showPw ? t.hide : t.show}
                  >
                    <span className="text-xs">{showPw ? t.hide : t.show}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-2 text-sm text-sky-700 underline underline-offset-2 dark:text-sky-300"
                >
                  {t.forgot}
                </button>
              </div>

              <label className="flex items-center gap-3 text-sm text-black/80 dark:text-white/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-black/20 bg-white dark:border-white/20 dark:bg-white/10"
                />
                {t.remember}
              </label>

              <button type="submit" className="btn-futuristic-red w-full py-3">
                {t.signIn}
              </button>
            </form>

            {/* Bottom promo band */}
            <div className="mt-10 rounded-2xl bg-sky-50 p-6 dark:bg-white/5">
              <div className="text-sm font-semibold">{t.firstTime}</div>
              <div className="mt-2 text-sm text-black/70 dark:text-white/70">
                {t.firstTimeBody}
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-sky-600/30 bg-white px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:border-white/10 dark:bg-white/5 dark:text-sky-300 dark:hover:bg-white/10"
                onClick={() => navigate("/account/create")}
              >
                {t.createAccount}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
