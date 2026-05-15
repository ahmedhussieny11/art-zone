/** مسارات الإطارات: frame_0001.jpg / .webp … */

export function frameUrl(
  basePath: string,
  index: number,
  extension = "jpg",
  pad = 4,
): string {
  const base = basePath.replace(/\/$/, "");
  const ext = extension.replace(/^\./, "");
  const name = `frame_${String(index).padStart(pad, "0")}.${ext}`;
  return `${base}/${name}`;
}

export function buildFrameUrls(
  basePath: string,
  frameCount: number,
  startIndex = 1,
  extension = "jpg",
): string[] {
  const urls: string[] = [];
  for (let i = 0; i < frameCount; i++) {
    urls.push(frameUrl(basePath, startIndex + i, extension));
  }
  return urls;
}

function loadOne(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`فشل تحميل الإطار: ${src}`));
    img.src = src;
  });
}

/** تحميل دفعات — أنسب لـ 900+ إطار من تحميلهم كلهم مرة واحدة */
export async function preloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
  batchSize = 16,
): Promise<HTMLImageElement[]> {
  const total = urls.length;
  const images: HTMLImageElement[] = new Array(total);
  let loaded = 0;

  for (let i = 0; i < total; i += batchSize) {
    const slice = urls.slice(i, i + batchSize);
    const batch = await Promise.all(slice.map((src, j) => loadOne(src).then((img) => ({ idx: i + j, img }))));
    for (const { idx, img } of batch) {
      images[idx] = img;
      loaded += 1;
      onProgress?.(loaded, total);
    }
  }

  return images;
}

/** رسم الصورة على الـ canvas بمنطق object-fit: cover */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;

  const scale = Math.max(width / iw, height / ih);
  const w = iw * scale;
  const h = ih * scale;
  const x = (width - w) / 2;
  const y = (height - h) / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, x, y, w, h);
}

export function progressToFrameIndex(
  progress: number,
  frameCount: number,
): number {
  if (frameCount <= 1) return 0;
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(frameCount - 1, Math.round(p * (frameCount - 1)));
}
