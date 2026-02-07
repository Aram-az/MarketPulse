import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lang = "en" | "fr";

export default function LoginPage() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const t = useMemo(() => {
    const en = {
      languageToggle: "Français",
      bankName: "NATIONAL BANK",
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
    };

    const fr = {
      languageToggle: "English",
      bankName: "BANQUE NATIONALE",
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
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  return (
    <section className="min-h-screen bg-[#f7f7f8]" lang={lang}>
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
        {/* Left image */}
        <div className="relative hidden flex-1 lg:block">
          <img
            src="https://cdn6.dissolve.com/p/D430_47_298/D430_47_298_1200.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>

        {/* Right form panel */}
        <div className="flex w-full items-center justify-end bg-white px-6 py-10 lg:w-[520px] lg:px-10">
          <div className="w-full max-w-md lg:pl-2">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Logo image (transparent background) */}
                <img
                  src="https://images.seeklogo.com/logo-png/28/2/national-bank-of-canada-logo-png_seeklogo-281864.png"
                  alt=""
                  className="h-12 w-16 object-contain"

                />
                <div className="text-sm font-semibold tracking-wide">
                  {t.bankName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
                className=" cursor-pointer text-sm text-sky-700 underline underline-offset-2"
              >
                {t.languageToggle}
              </button>
            </div>

            <h1 className="mt-10 text-3xl font-semibold text-black">
              {t.greeting}
            </h1>

            {/* Form */}
            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/"); // landing page after sign in
              }}
            >
              <div>
                <label className="text-sm font-medium text-black" htmlFor="email">
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium text-black"
                  htmlFor="password"
                >
                  {t.passwordLabel}
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    aria-pressed={showPw}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/60 hover:bg-black/5"
                    title={showPw ? t.hide : t.show}
                  >
                    <span className="text-xs">{showPw ? t.hide : t.show}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-2 text-sm text-sky-700 underline underline-offset-2"
                >
                  {t.forgot}
                </button>
              </div>

              <label className="flex items-center gap-3 text-sm text-black/80">
                <input type="checkbox" className="h-4 w-4 rounded border-black/20" />
                {t.remember}
              </label>

              <button type="submit" className="btn-futuristic-red w-full py-3">
                {t.signIn}
              </button>
            </form>

            {/* Bottom promo band */}
            <div className="mt-10 rounded-2xl bg-sky-50 p-6">
              <div className="text-sm font-semibold text-black">{t.firstTime}</div>
              <div className="mt-2 text-sm text-black/70">{t.firstTimeBody}</div>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-sky-600/30 bg-white px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-50"
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
