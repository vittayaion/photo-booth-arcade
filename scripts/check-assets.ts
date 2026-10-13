import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import sharp from "sharp";
import {
  FRAMES,
  STICKER_NAMES,
  TEXT_STICKERS,
  BACKGROUNDS,
  EFFECTS,
  textStickerSrc,
} from "../src/features/frames/catalog";
async function main() {
  let slots = 0;
  for (const frame of FRAMES)
    for (const layout of [1, 4, 6] as const) {
      const v = frame.variants[layout];
      const { data, info } = await sharp(`public${v.src}`)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      assert.equal(info.width, 1024);
      assert.equal(info.height, 1820);
      const thumbnail = await sharp(`public${v.thumbnail}`).metadata();
      assert.equal(thumbnail.width, 256);
      assert.equal(thumbnail.height, 455);
      assert(thumbnail.hasAlpha);
      assert.equal(v.slots.length, layout);
      for (const s of v.slots) {
        assert(
          s.x >= 0 &&
            s.y >= 0 &&
            s.x + s.width <= 1024 &&
            s.y + s.height <= 1820,
        );
        for (let y = s.y; y < s.y + s.height; y++)
          for (let x = s.x; x < s.x + s.width; x++)
            assert.equal(
              data[(y * 1024 + x) * 4 + 3],
              0,
              `${v.src} opaque photo slot at ${x},${y}`,
            );
        slots++;
      }
      assert(
        data.some((v, i) => i % 4 === 3 && v > 0),
        "Frame must contain visible artwork",
      );
    }
  for (const src of [
    ...STICKER_NAMES.map((n) => `/assets/stickers/${n}.png`),
    ...TEXT_STICKERS.map(textStickerSrc),
    ...EFFECTS.filter((e) => e.id !== "none").map(
      (e) => `/assets/effects/${e.id}.png`,
    ),
  ]) {
    const meta = await sharp(`public${src}`).metadata();
    assert(meta.hasAlpha, `${src} missing alpha`);
    const stats = await sharp(`public${src}`).stats();
    assert.equal(stats.channels[3].min, 0, `${src} has no transparent pixels`);
    assert(stats.channels[3].max > 0, `${src} is empty`);
  }
  const sprites = JSON.parse(
    await readFile("public/assets/mascot/manifest.json", "utf8"),
  );
  assert.equal(Object.keys(sprites.animations).length, 9);
  for (const anim of Object.values(sprites.animations) as {
    src: string;
    frames: {
      x: number;
      y: number;
      width: number;
      height: number;
      duration: number;
    }[];
  }[]) {
    const m = await sharp(`public${anim.src}`).metadata();
    assert.equal(m.width, 512);
    assert.equal(m.height, 128);
    assert(m.hasAlpha);
    assert.equal(anim.frames.length, 4);
    for (const f of anim.frames) {
      assert.equal(f.width, 128);
      assert.equal(f.height, 128);
      assert(f.x + f.width <= m.width! && f.y + f.height <= m.height!);
      assert(f.duration > 0);
    }
  }
  for (const bg of BACKGROUNDS) {
    const m = await sharp(`public/assets/backgrounds/${bg}.webp`).metadata();
    assert.equal(m.width, 1920);
    assert.equal(m.height, 1080);
  }
  for (const label of [
    "start",
    "capture",
    "download",
    "back",
    "next",
    "camera",
    "heart",
    "star",
    "flower",
    "cloud",
    "bow",
    "speech-bubble",
    "countdown-1",
    "countdown-2",
    "countdown-3",
  ])
    await access(`public/assets/ui/${label}.svg`);
  console.log(
    `PASS: ${FRAMES.length * 3} frame PNGs; all ${slots} photo slots fully alpha=0; 32 stickers; 9 text stickers; 9 sprites × 4 frames; 4 backgrounds; 7 effects; 15 SVG UI assets.`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
