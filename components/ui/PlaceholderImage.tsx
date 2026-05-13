interface PlaceholderImageProps {
  className?: string;
  label?: string;
  compact?: boolean;
}

export default function PlaceholderImage({
  className = "",
  label = "Art Zone Design",
  compact = false,
}: PlaceholderImageProps) {
  return (
    <div
      className={`placeholder-image ${className}`}
      role="img"
      aria-label={label}
    >
      {!compact && (
        <div className="text-center">
          <span className="font-serif text-base font-light tracking-wider text-white/40 md:text-lg">
            ART<span className="text-gold/40">ZONE</span>
          </span>
        </div>
      )}
    </div>
  );
}
