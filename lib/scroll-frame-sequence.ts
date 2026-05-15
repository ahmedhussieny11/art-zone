/** مسارات الإطارات: frame_0001.jpg / .webp … */

/** يكفي للبدء السريع — باقي الإطارات يُحمَّل في الخلفية */
export const INITIAL_PRELOAD_COUNT = 72;
export const PRELOAD_BATCH_SIZE = 40;

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

/** أقرب إطار محمّل عندما المطلوب لم يكتمل بعد */
export function nearestLoadedFrame(
  images: (HTMLImageElement | undefined)[],
  index: number,
): HTMLImageElement | null {
  const img = images[index];
  if (img) return img;
  const max = images.length;
  for (let d = 1; d < max; d++) {
    const lo = index - d;
    const hi = index + d;
    if (lo >= 0 && images[lo]) return images[lo]!;
    if (hi < max && images[hi]) return images[hi]!;
  }
  return null;
}

async function loadBatch(
  urls: string[],
  images: (HTMLImageElement | undefined)[],
  indices: number[],
  onEachLoaded: () => void,
): Promise<void> {
  await Promise.all(
    indices.map(async (idx) => {
      if (images[idx]) {
        onEachLoaded();
        return;
      }
      try {
        images[idx] = await loadOne(urls[idx]!);
      } catch {
        /* تخطّي إطار تالف — لا نوقف التحميل كله */
      }
      onEachLoaded();
    }),
  );
}

export type PreloadProgress = {
  loaded: number;
  total: number;
  playable: boolean;
};

/**
 * مرحلة 1: أول N إطار (يبدأ السكروب فوراً).
 * مرحلة 2: باقي الإطارات في الخلفية لسلاسة كاملة.
 */
export function startStagedPreload(
  urls: string[],
  callbacks: {
    onProgress: (p: PreloadProgress) => void;
    onPlayable: (images: (HTMLImageElement | undefined)[]) => void;
    onComplete: (images: (HTMLImageElement | undefined)[]) => void;
    onError: (err: Error) => void;
  },
  opts?: { initialCount?: number; batchSize?: number },
): () => void {
  const total = urls.length;
  const initialCount = Math.min(opts?.initialCount ?? INITIAL_PRELOAD_COUNT, total);
  const batchSize = opts?.batchSize ?? PRELOAD_BATCH_SIZE;
  const images: (HTMLImageElement | undefined)[] = new Array(total);
  let loaded = 0;
  let cancelled = false;

  const report = (playable: boolean) => {
    callbacks.onProgress({ loaded, total, playable });
  };

  (async () => {
    try {
      const priority: number[] = [];
      for (let i = 0; i < initialCount; i++) priority.push(i);

      for (let i = 0; i < priority.length; i += batchSize) {
        if (cancelled) return;
        await loadBatch(urls, images, priority.slice(i, i + batchSize), () => {
          loaded += 1;
          report(false);
        });
      }

      if (cancelled) return;
      callbacks.onPlayable(images);
      report(true);

      const rest: number[] = [];
      for (let i = initialCount; i < total; i++) rest.push(i);

      for (let i = 0; i < rest.length; i += batchSize) {
        if (cancelled) return;
        await loadBatch(urls, images, rest.slice(i, i + batchSize), () => {
          loaded += 1;
          report(true);
        });
      }

      if (!cancelled) callbacks.onComplete(images);
    } catch (err) {
      if (!cancelled) {
        callbacks.onError(
          err instanceof Error ? err : new Error("فشل تحميل الإطارات"),
        );
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}

/** @deprecated استخدم startStagedPreload */
export async function preloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
  batchSize = PRELOAD_BATCH_SIZE,
): Promise<HTMLImageElement[]> {
  return new Promise((resolve, reject) => {
    startStagedPreload(
      urls,
      {
        onProgress: ({ loaded, total }) => onProgress?.(loaded, total),
        onPlayable: () => {},
        onComplete: (imgs) => resolve(imgs as HTMLImageElement[]),
        onError: reject,
      },
      { initialCount: urls.length, batchSize },
    );
  });
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
