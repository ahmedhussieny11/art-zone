import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";

export default async function Loading() {
  const dict = getDict(await getSiteLocale());
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin border-2 border-gold border-t-transparent" />
        <span className="font-serif text-sm tracking-wider text-warmgray">
          {t(dict, "loading.text")}
        </span>
      </div>
    </div>
  );
}
