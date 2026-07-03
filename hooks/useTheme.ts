"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reads the class already applied by the anti-FOUC script in <head>
    // (runs before hydration) — required here rather than during render to
    // avoid a server/client markup mismatch, since the server can't know the
    // visitor's theme preference.
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Side effects live here, outside the state updater — React (in Strict
    // Mode) may invoke a functional updater more than once to check for
    // impurities, which would otherwise toggle the DOM class twice and
    // silently cancel itself out.
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  };

  return { theme, toggleTheme, mounted };
}
