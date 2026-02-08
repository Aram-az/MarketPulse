import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme/ThemeContext";

type SettingsState = {
  reduceMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
  analyticsOptOut: boolean;
  doNotTrackHint: boolean;
};

const STORAGE_KEY = "app_settings_v1";

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        reduceMotion: false,
        highContrast: false,
        largerText: false,
        analyticsOptOut: true,
        doNotTrackHint: true,
      };
    }
    return { ...JSON.parse(raw) } as SettingsState;
  } catch {
    return {
      reduceMotion: false,
      highContrast: false,
      largerText: false,
      analyticsOptOut: true,
      doNotTrackHint: true,
    };
  }
}

function saveSettings(s: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {description && <div className="mt-1 text-xs text-white/60">{description}</div>}
      </div>

      <button
        type="button"
        className="btn-futuristic-red"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        {checked ? t("common.on") : t("common.off")}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);

    const root = document.documentElement;
    root.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
    root.classList.toggle("a11y-high-contrast", settings.highContrast);
    root.classList.toggle("a11y-large-text", settings.largerText);
  }, [settings]);

  const privacySummary = useMemo(() => {
    const analytics = settings.analyticsOptOut
      ? t("settings.privacySummary.analyticsOff")
      : t("settings.privacySummary.analyticsOn");

    const dnt = settings.doNotTrackHint
      ? t("settings.privacySummary.dntOn")
      : t("settings.privacySummary.dntOff");

    return `${analytics} • ${dnt}`;
  }, [settings.analyticsOptOut, settings.doNotTrackHint, t]);

  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "en";

  return (
    <section className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">{t("settings.title")}</h1>
          <p className="mt-2 text-sm text-white/60">{t("settings.subtitle")}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">
                {t("settings.appearance")}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black p-4">
                <div className="text-xs text-white/60">{t("settings.theme")}</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-futuristic-red"
                    onClick={() => setTheme("dark")}
                    aria-pressed={theme === "dark"}
                  >
                    {t("settings.dark")}
                  </button>
                  <button
                    type="button"
                    className="btn-futuristic-red"
                    onClick={() => setTheme("light")}
                    aria-pressed={theme === "light"}
                  >
                    {t("settings.light")}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">
                {t("settings.language")}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black p-4">
                <label className="text-xs text-white/60">{t("settings.appLanguage")}</label>

                {/* Wrapper gives us consistent hover/focus visuals */}
                <div className="relative mt-2">
                  <select
                    value={currentLang}
                    onChange={(e) => i18n.changeLanguage(e.target.value)} // supported approach [web:101]
                    className="w-full appearance-none rounded-lg border border-white/10 bg-black px-3 py-2 pr-10 text-white placeholder:text-white/40 focus:border-[#DC143C]/50 focus:outline-none hover:border-white/20"
                  >
                    <option value="en">{t("settings.english")}</option>
                    <option value="fr">{t("settings.french")}</option>
                  </select>

                  {/* Chevron */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M5.5 7.5 10 12l4.5-4.5 1.5 1.5L10 15 4 9l1.5-1.5z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-3 text-xs text-white/50">
                  {t("settings.languageHelp")}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">
                {t("settings.accessibility")}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
                <div className="px-4">
                  <ToggleRow
                    label={t("settings.reduceMotion")}
                    description={t("settings.reduceMotionDesc")}
                    checked={settings.reduceMotion}
                    onChange={(v) => setSettings((s) => ({ ...s, reduceMotion: v }))}
                  />
                  <div className="border-t border-white/10" />
                  <ToggleRow
                    label={t("settings.highContrast")}
                    description={t("settings.highContrastDesc")}
                    checked={settings.highContrast}
                    onChange={(v) => setSettings((s) => ({ ...s, highContrast: v }))}
                  />
                  <div className="border-t border-white/10" />
                  <ToggleRow
                    label={t("settings.largerText")}
                    description={t("settings.largerTextDesc")}
                    checked={settings.largerText}
                    onChange={(v) => setSettings((s) => ({ ...s, largerText: v }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t("settings.privacy")}
                  </div>
                  <div className="mt-1 text-xs text-white/60">{privacySummary}</div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
                <div className="px-4">
                  <ToggleRow
                    label={t("settings.analyticsOptOut")}
                    description={t("settings.analyticsOptOutDesc")}
                    checked={settings.analyticsOptOut}
                    onChange={(v) => setSettings((s) => ({ ...s, analyticsOptOut: v }))}
                  />
                  <div className="border-t border-white/10" />
                  <ToggleRow
                    label={t("settings.respectDnt")}
                    description={t("settings.respectDntDesc")}
                    checked={settings.doNotTrackHint}
                    onChange={(v) => setSettings((s) => ({ ...s, doNotTrackHint: v }))}
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-white/50">
                {t("settings.privacyTip")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
