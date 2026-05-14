"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/portfolio", label: "أعمالنا" },
  { href: "/services", label: "خدماتنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<{
    logo: string | null;
    siteName: string;
    headerCtaText: string;
    headerCtaLink: string;
  }>({ logo: null, siteName: "ARTZONE", headerCtaText: "احصل على عرض سعر", headerCtaLink: "/contact" });
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setSettings({
          logo: s.logo || null,
          siteName: s.siteName || "ARTZONE",
          headerCtaText: s.headerCtaText || "احصل على عرض سعر",
          headerCtaLink: s.headerCtaLink || "/contact",
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
          <>{nameParts[0]}<span className="text-gold">{nameParts[1]}</span></>
        ) : (
          <>{settings.siteName}</>
        )}
      </span>
    );
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-6 py-3.5 transition-all duration-500 ${
            isOpen
              ? "bg-offwhite shadow-lg"
              : showSolid
              ? "border border-warmgray/10 bg-offwhite/90 shadow-lg shadow-charcoal/5 backdrop-blur-xl"
              : "border border-white/10 bg-white/5 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="relative z-10">
            <span className={`transition-colors duration-500 ${isOpen || showSolid ? "text-charcoal" : "text-white"}`}>
              {renderLogo("text-xl")}
            </span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    showSolid ? "text-charcoal/80" : "text-white/70"
                  } ${pathname === link.href ? "text-gold" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={settings.headerCtaLink}
                className="relative overflow-hidden rounded-xl bg-gold px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-gold-dark hover:shadow-md hover:shadow-gold/25"
              >
                {settings.headerCtaText}
              </Link>
            </li>
          </ul>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="القائمة"
          >
            <span className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "translate-y-2 rotate-45 bg-charcoal" : showSolid ? "bg-charcoal" : "bg-white"}`} />
            <span className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "opacity-0 bg-charcoal" : showSolid ? "bg-charcoal" : "bg-white"}`} />
            <span className={`h-0.5 w-6 transition-all duration-300 ${isOpen ? "-translate-y-2 -rotate-45 bg-charcoal" : showSolid ? "bg-charcoal" : "bg-white"}`} />
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] flex items-center justify-center bg-offwhite"
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
                  <Link href={link.href} onClick={() => setIsOpen(false)} className="font-serif text-2xl font-light tracking-wider text-charcoal transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={settings.headerCtaLink} onClick={() => setIsOpen(false)} className="mt-4 inline-block rounded-xl bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-all hover:bg-gold-dark">
                  {settings.headerCtaText}
                </Link>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
