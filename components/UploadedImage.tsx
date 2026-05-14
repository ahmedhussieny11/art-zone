import Image, { type ImageProps } from "next/image";
import { normalizeMediaPath } from "@/lib/media-url";

function isAbsoluteHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function isUploadPath(s: string): boolean {
  return s.startsWith("/uploads") || s.startsWith("/public/");
}

/**
 * صور الرفع والوسائط الخارجية.
 * تعطيل optimizer لـ `/uploads` وللروابط https يحل مشاكل عدم ظهور الصور مع next/image على بعض الاستضافات.
 */
export default function UploadedImage(props: ImageProps) {
  const src =
    typeof props.src === "string" ? normalizeMediaPath(props.src) : props.src;
  const unopt =
    (typeof src === "string" && (isAbsoluteHttpUrl(src) || isUploadPath(src))) ||
    props.unoptimized === true;
  return <Image {...props} src={src} unoptimized={unopt} />;
}
