export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin border-2 border-gold border-t-transparent" />
        <span className="font-serif text-sm tracking-wider text-warmgray">
          جاري التحميل...
        </span>
      </div>
    </div>
  );
}
