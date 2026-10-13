import type { EffectId, PhotoSlot } from "../frames/catalog";
const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      imageCache.delete(src);
      reject(new Error("โหลดภาพไม่สำเร็จ"));
    };
    img.src = src;
  });
  if (!src.startsWith("blob:")) imageCache.set(src, promise);
  return promise;
}
export function coverCrop(sw: number, sh: number, dw: number, dh: number) {
  const ratio = Math.max(dw / sw, dh / sh);
  const width = dw / ratio,
    height = dh / ratio;
  return { x: (sw - width) / 2, y: (sh - height) / 2, width, height };
}
export async function photograph(
  source: HTMLVideoElement | HTMLImageElement,
  slot: PhotoSlot,
  effect: EffectId,
  mirror = false,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = slot.width;
  canvas.height = slot.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("อุปกรณ์นี้ไม่รองรับ Canvas");
  const sw =
    source instanceof HTMLVideoElement
      ? source.videoWidth
      : source.naturalWidth;
  const sh =
    source instanceof HTMLVideoElement
      ? source.videoHeight
      : source.naturalHeight;
  if (!sw || !sh) throw new Error("กล้องยังไม่พร้อม ลองอีกครั้งนะ");
  const crop = coverCrop(sw, sh, canvas.width, canvas.height);
  ctx.save();
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  ctx.restore();
  if (effect !== "none") {
    const overlay = await loadImage(`/assets/effects/${effect}.png`);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("บันทึกภาพไม่สำเร็จ")),
      "image/png",
    ),
  );
}
export function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener("abort", done, { once: true });
  });
}
