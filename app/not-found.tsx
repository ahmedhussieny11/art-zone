import Link from "next/link";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";

export default async function NotFound() {
  const dict = getDict(await getSiteLocale());
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 text-center">
      <span className="font-serif text-8xl font-light text-gold/30">404</span>
      <h1 className="mt-4 font-serif text-3xl font-light text-charcoal">
        {t(dict, "notFound.title")}
      </h1>
      <p className="mt-3 max-w-md text-warmgray">
        {t(dict, "notFound.body")}
      </p>
      <Link
        href="/"
        className="mt-8 bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-all hover:bg-gold-dark"
      >
        {t(dict, "notFound.home")}
      </Link>
    </div>
  );
}
