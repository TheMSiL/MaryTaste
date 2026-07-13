"use client";

export default function ThemeToggle() {
  function toggleTheme() {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("marytaste-theme", nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-toggle print-hidden"
      onClick={toggleTheme}
      aria-label="Перемкнути колірну тему"
      title="Перемкнути колірну тему"
    >
      <span className="theme-toggle__moon" aria-hidden="true">
        ☾
      </span>
      <span className="theme-toggle__sun" aria-hidden="true">
        ☀
      </span>
    </button>
  );
}
