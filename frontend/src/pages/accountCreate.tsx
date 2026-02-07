import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lang = "en" | "fr";

function setDarkMode(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
}

export default function AccountCreate() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("en");
  const [darkMode, setDarkModeState] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      title: "Create your account",
      subtitle: "Use your legal name and a valid email address.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      password: "Password",
      show: "Show",
      hide: "Hide",
      create: "Create account",
      backToLogin: "Back to sign in",
      helperPw:
        "At least 8 characters (use a mix of letters, numbers, and symbols).",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
    };

    const fr = {
      languageToggle: "English",
      title: "Créer votre compte",
      subtitle: "Utilisez votre nom légal et une adresse courriel valide.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Adresse courriel",
      password: "Mot de passe",
      show: "Afficher",
      hide: "Masquer",
      create: "Créer le compte",
      backToLogin: "Retour à la connexion",
      helperPw:
        "Au moins 8 caractères (mélangez lettres, chiffres et symboles).",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none " +
    "placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)] " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 " +
    "dark:focus:shadow-[0_0_0_3px_rgba(255,45,166,0.18)]";

  return (
    <section
      className="min-h-screen bg-[#f7f7f8] text-black dark:bg-[#0b0f14] dark:text-white"
      lang={lang}
    >
      <div className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* Logo pill (single box) */}
              <div className="h-10 w-28 overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-[#8b8b8b]">
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

          <h1 className="mt-8 text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {t.subtitle}
          </p>

          {/* Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium" htmlFor="firstName">
                  {t.firstName}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.firstName}
                  autoComplete="given-name"
                  required
                  minLength={2}
                  maxLength={40}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="lastName">
                  {t.lastName}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t.lastName}
                  autoComplete="family-name"
                  required
                  minLength={2}
                  maxLength={40}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="email">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                maxLength={254}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="newPassword">
                {t.password}
              </label>

              <div className="relative mt-2">
                <input
                  id="newPassword"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  className={
                    inputClass.replace("mt-2 ", "").replace("pr-16", "") + " pr-16"
                  }
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

              <div className="mt-2 text-xs text-black/55 dark:text-white/55">
                {t.helperPw}
              </div>
            </div>

            <button type="submit" className="btn-futuristic-red w-full py-3">
              {t.create}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
            >
              {t.backToLogin}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
