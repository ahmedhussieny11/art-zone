"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { MessageDict, SiteLocale } from "@/lib/locale-dict";
import { getDict, t as tFn } from "@/lib/locale-dict";
import { ADMIN_UI_BASE } from "@/lib/admin-path";

type LocaleContextValue = {
  locale: SiteLocale;
  setLocale: (next: SiteLocale) => Promise<void>;
  t: (path: string, vars?: Record<string, string>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useSiteLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useSiteLocale must be used within SiteProviders");
  return ctx;
}

type ThemeContextValue = {
  darkModeEnabled: boolean;
  theme: "light" | "dark";
  setTheme: (next: "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useSiteTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useSiteTheme must be used within SiteProviders");
  return ctx;
}

const THEME_STORAGE = "site-theme";

export default function SiteProviders({
  children,
  initialLocale,
  dict,
  darkModeEnabled,
}: {
  children: React.ReactNode;
  initialLocale: SiteLocale;
  dict: MessageDict;
  darkModeEnabled: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<SiteLocale>(initialLocale);
  const [dictState, setDictState] = useState<MessageDict>(dict);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const isAdminPath =
    pathname.startsWith(ADMIN_UI_BASE) || pathname.startsWith("/admin");

  useEffect(() => {
    setLocaleState(initialLocale);
    setDictState(dict);
  }, [initialLocale, dict]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (isAdminPath) {
      el.lang = "ar";
      el.dir = "rtl";
      return;
    }
    el.lang = locale === "en" ? "en" : "ar";
    el.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, isAdminPath]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const el = document.documentElement;
    if (!darkModeEnabled || isAdminPath) {
      el.classList.remove("dark");
      return;
    }
    const stored = window.localStorage.getItem(THEME_STORAGE);
    const initial: "light" | "dark" = stored === "dark" ? "dark" : "light";
    setThemeState(initial);
    el.classList.toggle("dark", initial === "dark");
  }, [darkModeEnabled, isAdminPath]);

  const setTheme = useCallback(
    (next: "light" | "dark") => {
      if (!darkModeEnabled || isAdminPath) return;
      setThemeState(next);
      try {
        window.localStorage.setItem(THEME_STORAGE, next);
      } catch {
        /* ignore */
      }
      document.documentElement.classList.toggle("dark", next === "dark");
    },
    [darkModeEnabled, isAdminPath]
  );

  const setLocale = useCallback(
    async (next: SiteLocale) => {
      await fetch("/api/site-locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      setLocaleState(next);
      setDictState(getDict(next));
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (path: string, vars?: Record<string, string>) => tFn(dictState, path, vars),
    [dictState]
  );

  const localeValue = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  const themeValue = useMemo(
    () => ({ darkModeEnabled: darkModeEnabled && !isAdminPath, theme, setTheme }),
    [darkModeEnabled, isAdminPath, theme, setTheme]
  );

  return (
    <LocaleContext.Provider value={localeValue}>
      <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
    </LocaleContext.Provider>
  );
}
