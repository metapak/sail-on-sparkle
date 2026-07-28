import * as React from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeChoice;
  resolved: ResolvedTheme;
  setTheme: (t: ThemeChoice) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "sonar.theme";

function readStored(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

function resolveTheme(t: ThemeChoice): ResolvedTheme {
  if (t !== "system") return t;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyToDocument(r: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (r === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}

/**
 * Module-level singletons — the ONE authoritative client theme state.
 *
 * Route transitions inside the dashboard can remount the provider. Without a
 * shared cache each remount would fall back to "system"/dark for a frame and
 * the user's explicit choice would appear to reset. `cachedTheme` keeps the
 * resolved choice across remounts; `mountCount` makes the "reset to dark on
 * leaving the dashboard" cleanup ref-counted so a remount never clears it.
 */
let cachedTheme: ThemeChoice | null = null;
let mountCount = 0;

/**
 * Dashboard-scoped theme provider. Mounting applies the chosen theme to <html>.
 * Unmounting resets to the dark default so the public landing stays dark-only.
 *
 * The initial React state MUST be deterministic across SSR and first client
 * render (both use "system"/"dark"). The pre-hydration inline script in
 * __root.tsx already applies the correct class to <html> before hydration
 * so there is no visual flash. After mount, we read localStorage and sync
 * both React state and the document class.
 */
export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeChoice>("system");
  const [resolved, setResolved] = React.useState<ResolvedTheme>("dark");
  /**
   * Hydration guard — the ONE thing that keeps the deterministic initial
   * "system" state from being written to <html> before the stored preference
   * has landed in React state. Without it the apply-effect below runs in the
   * same commit as the hydrate effect, still sees "system", and (on a
   * light OS) briefly flips a stored dark preference to light.
   */
  const [hydrated, setHydrated] = React.useState(false);

  // On mount, hydrate from storage. Runs client-only, avoiding SSR/CSR
  // markup mismatch in components that render based on `theme` / `resolved`.
  // Idempotent under Strict Mode: it only reads storage and re-applies the
  // same resolved value.
  React.useEffect(() => {
    const stored = cachedTheme ?? readStored();
    cachedTheme = stored;
    setThemeState(stored);
    const r = resolveTheme(stored);
    setResolved(r);
    applyToDocument(r);
    setHydrated(true);
  }, []);

  // Apply whenever theme changes after mount — never before hydration.
  React.useEffect(() => {
    if (!hydrated) return;
    const r = resolveTheme(theme);
    setResolved(r);
    applyToDocument(r);
  }, [hydrated, theme]);

  // React to OS theme changes when set to "system".
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      const r: ResolvedTheme = mq.matches ? "light" : "dark";
      setResolved(r);
      applyToDocument(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Reset to dark only when the LAST dashboard provider unmounts, so the
  // public landing stays dark-only while in-dashboard remounts keep the theme.
  React.useEffect(() => {
    mountCount += 1;
    return () => {
      mountCount -= 1;
      queueMicrotask(() => {
        if (mountCount > 0 || typeof document === "undefined") return;
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      });
    };
  }, []);

  const setTheme = React.useCallback((t: ThemeChoice) => {
    cachedTheme = t;
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Fallback so components render even outside the provider (e.g. storybook).
    return { theme: "dark", resolved: "dark", setTheme: () => {} };
  }
  return ctx;
}
