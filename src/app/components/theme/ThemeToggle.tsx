"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-[color-mix(in oklab,var(--color-surface),var(--color-foreground)10%)] focus:outline-none focus:ring-2 focus:ring-accent"
      aria-pressed={isDark}
      title="Toggle theme"
    >
      <span className="i-lucide-sun dark:i-lucide-moon" />
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
