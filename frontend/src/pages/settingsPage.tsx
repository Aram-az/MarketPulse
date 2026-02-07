import { useTheme } from "../theme/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="min-h-screen bg-[#f7f7f8] text-black dark:bg-[#0b0f14] dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <button
          type="button"
          onClick={toggleTheme}
          className="mt-6 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
        >
          Theme: {theme}
        </button>
      </div>
    </section>
  );
}
