import FadeIn from "./FadeIn";

const LABEL_SIZE_MAP: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const TITLE_SIZE_MAP: Record<string, string> = {
  "3xl": "text-3xl md:text-4xl",
  "4xl": "text-4xl md:text-5xl",
  "5xl": "text-4xl md:text-5xl lg:text-6xl",
  "6xl": "text-5xl md:text-6xl lg:text-7xl",
  "7xl": "text-6xl md:text-7xl lg:text-8xl",
};

const BODY_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
  "2xl": "text-2xl md:text-3xl",
};

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "start";
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
  style?: React.CSSProperties;
}

export default function SectionHeading({
  label,
  title,
  description,
  className = "",
  align = "center",
  labelSize = "sm",
  titleSize = "5xl",
  bodySize = "lg",
  style,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const labelCls = LABEL_SIZE_MAP[labelSize] || LABEL_SIZE_MAP.sm;
  const titleCls = TITLE_SIZE_MAP[titleSize] || TITLE_SIZE_MAP["5xl"];
  const bodyCls = BODY_SIZE_MAP[bodySize] || BODY_SIZE_MAP.lg;

  return (
    <div className={`${isCenter ? "text-center" : "text-start"} ${className}`} style={style}>
      <FadeIn>
        {label && (
          <span className={`mb-4 inline-block font-semibold tracking-[0.15em] text-gold ${labelCls}`}>
            {label}
          </span>
        )}
        <h2 className={`font-serif font-light leading-tight text-charcoal ${titleCls}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-5 leading-relaxed text-warmgray ${bodyCls} ${isCenter ? "mx-auto max-w-2xl" : ""}`}>
            {description}
          </p>
        )}
      </FadeIn>
    </div>
  );
}
