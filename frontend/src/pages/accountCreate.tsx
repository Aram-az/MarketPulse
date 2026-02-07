import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lang = "en" | "fr";

export default function AccountCreate() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("en");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const t = useMemo(() => {
    const en = {
      languageToggle: "Français",
      bankName: "NATIONAL BANK",
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
    };

    const fr = {
      languageToggle: "English",
      bankName: "BANQUE NATIONALE",
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
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  return (
    <section className="min-h-screen bg-[#f7f7f8]" lang={lang}>
      <div className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-24">
                <img
                  src="https://images.seeklogo.com/logo-png/28/2/national-bank-of-canada-logo-png_seeklogo-281864.png"
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-sm font-semibold tracking-wide">
                {t.bankName}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
              className="cursor-pointer text-sm text-sky-700 underline underline-offset-2 hover:text-sky-800"
            >
              {t.languageToggle}
            </button>
          </div>

          <h1 className="mt-8 text-3xl font-semibold text-black">{t.title}</h1>
          <p className="mt-2 text-sm text-black/60">{t.subtitle}</p>

          {/* Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              // For now: just demonstrate "success" navigation
              navigate("/login");
            }}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-black" htmlFor="firstName">
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
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black" htmlFor="lastName">
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
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-black" htmlFor="email">
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
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black" htmlFor="newPassword">
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
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-16 text-sm outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
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

              <div className="mt-2 text-xs text-black/55">{t.helperPw}</div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-futuristic-red w-full py-3">
              {t.create}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/5"
            >
              {t.backToLogin}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
