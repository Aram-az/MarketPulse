import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";

type Lang = "en" | "fr";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const [lang, setLang] = useState<Lang>("en");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const t = useMemo(() => {
    const en = {
      languageToggle: "Français",
      greeting: "Sign in",
      subtitle: "Use the email and password you created for your account.",
      emailLabel: "Email address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      show: "Show",
      hide: "Hide",
      forgot: "Forgotten password?",
      remember: "Remember my email address",
      signIn: "Sign in",
      firstTime: "First time signing in?",
      firstTimeBody:
        "Create your account to access all our online services with a single password.",
      createAccount: "Create your account",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      passwordRequired: "Please enter your password.",
    };

    const fr = {
      languageToggle: "English",
      greeting: "Ouvrir une session",
      subtitle: "Utilisez l’adresse courriel et le mot de passe de votre compte.",
      emailLabel: "Adresse courriel",
      emailPlaceholder: "nom@exemple.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      show: "Afficher",
      hide: "Masquer",
      forgot: "Mot de passe oublié?",
      remember: "Se souvenir de mon adresse courriel",
      signIn: "Ouvrir une session",
      firstTime: "Première connexion?",
      firstTimeBody:
        "Créez votre compte pour accéder à tous nos services en ligne avec un seul mot de passe.",
      createAccount: "Créer votre compte",
      emailRequired: "Veuillez entrer votre adresse courriel.",
      emailInvalid: "Veuillez entrer une adresse courriel valide.",
      passwordRequired: "Veuillez entrer votre mot de passe.",
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/10 bg-black px-4 py-3 text-sm text-white outline-none ring-0 " +
    "placeholder:text-white/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)] " +
    "dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-white/40 " +
    "dark:focus:shadow-[0_0_0_3px_rgba(255,45,166,0.18)]";

  function clearValidity(el: HTMLInputElement | null) {
    if (!el) return;
    el.setCustomValidity("");
  }

  function validateAndReport(): boolean {
    const e = emailRef.current;
    const p = passwordRef.current;

    if (e) {
      if (e.validity.valueMissing) e.setCustomValidity(t.emailRequired);
      else if (e.validity.typeMismatch) e.setCustomValidity(t.emailInvalid);
      else e.setCustomValidity("");

      if (!e.checkValidity()) {
        e.reportValidity();
        e.focus();
        return false;
      }
    }

    if (p) {
      if (p.validity.valueMissing) p.setCustomValidity(t.passwordRequired);
      else p.setCustomValidity("");

      if (!p.checkValidity()) {
        p.reportValidity();
        p.focus();
        return false;
      }
    }

    return true;
  }

  return (
    <section className="min-h-screen bg-[#0b0f14] text-white" lang={lang}>
      <div className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-xl bg-black px-8 py-10 shadow-sm ring-1 ring-black/10 dark:ring-white/10">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* Logo pill (same as AccountCreate) */}
              <div className="h-10 w-28 overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-[#c1c1c1]">
                <img
                  src="/nb-logo.png"
                  alt="National Bank"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
              className="cursor-pointer text-sm text-sky-300 underline underline-offset-2 hover:text-sky-200"
            >
              {t.languageToggle}
            </button>
          </div>

          <h1 className="mt-8 text-3xl font-semibold">{t.greeting}</h1>
          <p className="mt-2 text-sm text-white/60">{t.subtitle}</p>

          <form
            className="mt-8 space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!validateAndReport()) return;
              navigate("/");
            }}
          >
            <div>
              <label className="text-sm font-medium" htmlFor="email">
                {t.emailLabel}
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInput={() => clearValidity(emailRef.current)}
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
                  ref={passwordRef}
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={() => clearValidity(passwordRef.current)}
                  placeholder={t.passwordPlaceholder}
                  className={inputClass.replace("mt-2 ", "") + " pr-12"}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  aria-pressed={showPw}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 hover:bg-white/10"
                  title={showPw ? t.hide : t.show}
                >
                  <span className="text-xs">{showPw ? t.hide : t.show}</span>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-sky-300 underline underline-offset-2 hover:text-sky-200"
                >
                  {t.forgot}
                </button>

                <label className="flex items-center gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  {t.remember}
                </label>
              </div>
            </div>

            <button type="submit" className="btn-futuristic-red w-full py-3">
              {t.signIn}
            </button>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold">{t.firstTime}</div>
              <div className="mt-2 text-sm text-white/70">{t.firstTimeBody}</div>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-white/10 bg-black px-4 py-3 text-sm font-semibold text-sky-300 hover:bg-white/10"
                onClick={() => navigate("/account/create")}
              >
                {t.createAccount}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
