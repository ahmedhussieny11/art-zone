import Image, { type ImageProps } from "next/image";

function isAbsoluteHttpUrl(src: ImageProps["src"]): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** صور من الرفع (مسار محلي أو رابط Blob/S3). الروابط الخارجية تُعرض بدون optimizer لتفادي قيود next/image. */
export default function UploadedImage(props: ImageProps) {
  const remote = isAbsoluteHttpUrl(props.src);
  return <Image {...props} unoptimized={remote || props.unoptimized} />;
}
