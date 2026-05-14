"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteLocale, useSiteTheme } from "@/components/SiteProviders";

export default function Navbar() {
  const { locale, setLocale, t } = useSiteLocale();
  const { darkModeEnabled, theme, setTheme } = useSiteTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<{
    logo: string | null;
    siteName: string;
    headerCtaText: string;
    headerCtaLink: string;
  }>({ logo: null, siteName: "ARTZONE", headerCtaText: "", headerCtaLink: "/contact" });
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/portfolio", label: t("nav.portfolio") },
    { href: "/services", label: t("nav.services") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setSettings({
          logo: s.logo || null,
          siteName: s.siteName || "ARTZONE",
          headerCtaText: s.headerCtaText?.trim() || "",
          headerCtaLink: s.headerCtaLink || "/contact",
        });
      })
      .catch(() => {});
  }, [locale]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const showSolid = scrolled || !isHomePage;

  const nameParts = settings.siteName.split(/(?<=ART)/i);
  const renderLogo = (sizeClass: string) => {
    if (settings.logo) {
      return <UploadedImage src={settings.logo} alt={settings.siteName} width={120} height={40} className={`object-contain ${sizeClass}`} />;
    }
    return (
      <span className={`font-serif font-bold tracking-wider ${sizeClass}`}>
        {nameParts.length > 1 ? (
          <>
            {nameParts[0]}
            <span className="text-gold">{nameParts[1]}</span>
          </>
        ) : (
          <>{settings.siteName}</>
        )}
      </span>
    );
  };

  function toggleDark() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-6 py-3.5 transition-all duration-500 ${
            isOpen
              ? "bg-offwhite shadow-lg dark:bg-zinc-900 dark:shadow-black/40"
              : showSolid
                ? "border border-warmgray/10 bg-offwhite/90 shadow-lg shadow-charcoal/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/30"
                : "border border-white/10 bg-white/5 backdrop-blur-md dark:border-white/10 dark:bg-black/25"
          }`}
        >
          <Link
            href="/"
            className="relative z-10 inline-flex shrink-0 cursor-pointer items-center"
            onClick={(e) => {
              setIsOpen(false);
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <span className={`transition-colors duration-500 ${isOpen || showSolid ? "text-charcoal" : "text-white"}`}>{renderLogo("text-xl")}</span>
          </Link>

          <ul className="hidden items-center gap-4 md:flex md:gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    showSolid ? "text-charcoal/80 dark:text-offwhite/80" : "text-white/70"
                  } ${pathname === link.href ? "text-gold" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2 border-charcoal/10 ps-2 dark:border-white/10 md:border-s">
              <div className="flex rounded-lg border border-warmgray/20 p-0.5 text-[11px] font-semibold dark:border-white/15">
                <button
                  type="button"
                  onClick={() => void setLocale("ar")}
                  className={`rounded-md px-2 py-1 transition-colors ${locale === "ar" ? "bg-gold text-white" : "text-warmgray hover:text-charcoal dark:text-offwhite/60 dark:hover:text-offwhite"}`}
                  aria-pressed={locale === "ar"}
                >
                  {t("nav.langArabic")}
                </button>
                <button
                  type="button"
                  onClick={() => void setLocale("en")}
                  className={`rounded-md px-2 py-1 transition-colors ${locale === "en" ? "bg-gold text-white" : "text-warmgray hover:text-charcoal dark:text-offwhite/60 dark:hover:text-offwhite"}`}
                  aria-pressed={locale === "en"}
                >
                  {t("nav.langEnglish")}
                </button>
              </div>
              {darkModeEnabled && (
                <button
                  type="button"
                  onClick={toggleDark}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-warmgray/20 transition-colors hover:border-gold/50 dark:border-white/15 ${
                    showSolid ? "text-charcoal dark:text-offwhite" : "text-white/80"
                  }`}
                  aria-label={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
                >
                  {theme === "dark" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                </button>
              )}
            </li>
            <li>
              <Link
                href={settings.headerCtaLink}
                className="relative overflow-hidden rounded-xl bg-gold px-5 py-2.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-gold-dark hover:shadow-md hover:shadow-gold/25 lg:px-6"
              >
                {settings.headerCtaText || t("nav.headerCtaDefault")}
              </Link>
            </li>
          </ul>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={t("nav.menuAria")}
          >
            <span
              className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "translate-y-2 rotate-45 bg-charcoal dark:bg-offwhite" : showSolid ? "bg-charcoal dark:bg-offwhite" : "bg-white"}`}
            />
            <span
              className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "opacity-0 bg-charcoal dark:bg-offwhite" : showSolid ? "bg-charcoal dark:bg-offwhite" : "bg-white"}`}
            />
            <span
              className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "-translate-y-2 -rotate-45 bg-charcoal dark:bg-offwhite" : showSolid ? "bg-charcoal dark:bg-offwhite" : "bg-white"}`}
            />
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] flex items-center justify-center bg-offwhite dark:bg-zinc-950"
            style={{ top: 0, left: 0, width: "100vw", height: "100dvh" }}
          >
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-8"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setIsOpen(false)} className="font-serif text-2xl font-light tracking-wider text-charcoal transition-colors hover:text-gold dark:text-offwhite">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex rounded-lg border border-warmgray/25 p-0.5 dark:border-white/20">
                  <button
                    type="button"
                    onClick={() => void setLocale("ar")}
                    className={`rounded-md px-3 py-1.5 text-sm ${locale === "ar" ? "bg-gold text-white" : "text-charcoal dark:text-offwhite"}`}
                  >
                    {t("nav.langArabic")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void setLocale("en")}
                    className={`rounded-md px-3 py-1.5 text-sm ${locale === "en" ? "bg-gold text-white" : "text-charcoal dark:text-offwhite"}`}
                  >
                    {t("nav.langEnglish")}
                  </button>
                </div>
                {darkModeEnabled && (
                  <button
                    type="button"
                    onClick={toggleDark}
                    className="rounded-lg border border-warmgray/25 px-3 py-1.5 text-sm text-charcoal dark:border-white/20 dark:text-offwhite"
                  >
                    {theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
                  </button>
                )}
              </li>
              <li>
                <Link
                  href={settings.headerCtaLink}
                  onClick={() => setIsOpen(false)}
                  className="mt-4 inline-block rounded-xl bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-all hover:bg-gold-dark"
                >
                  {settings.headerCtaText || t("nav.headerCtaDefault")}
                </Link>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
