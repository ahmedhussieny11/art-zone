import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 text-center">
      <span className="font-serif text-8xl font-light text-gold/30">404</span>
      <h1 className="mt-4 font-serif text-3xl font-light text-charcoal">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-md text-warmgray">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="mt-8 bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-all hover:bg-gold-dark"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
