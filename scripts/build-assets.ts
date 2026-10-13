import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  FRAMES,
  STICKER_NAMES,
  TEXT_STICKERS,
  BACKGROUNDS,
  EFFECTS,
  WIDTH,
  HEIGHT,
  textStickerSrc,
} from "../src/features/frames/catalog";
const root = "public/assets";
const svg = (body: string, w = 64, h = w) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  );
const navy = "#252044",
  pink = "#ff78b2",
  blue = "#8ddcff",
  purple = "#b9a5ff",
  yellow = "#ffe17f";
const shape = (body: string, color = pink) =>
  `<g fill="${color}" stroke="${navy}" stroke-width="2.1" stroke-linejoin="round">${body}</g>`;
const heart = (color = pink) =>
  shape(
    '<path d="M32 54 10 33C-3 16 18 4 32 20 46 4 67 16 54 33Z"/><path d="M14 24h6" fill="none" stroke="white" stroke-width="4"/>',
    color,
  );
const star = (color = yellow) =>
  shape(
    '<path d="m32 5 8 17 19 3-14 14 3 20-16-9-16 9 3-20L5 25l19-3Z"/><path d="m26 22 5-9" stroke="white" stroke-width="3"/>',
    color,
  );
const flower = (color = pink) =>
  shape(
    '<path d="M24 21C9 3 48-2 40 21 64 9 66 43 43 40 54 60 21 70 23 46 1 58-8 26 16 28Z"/><circle cx="31" cy="32" r="10" fill="#ffe17f"/><circle cx="28" cy="29" r="3" fill="#fff5e8" stroke="none"/>',
    color,
  );
const cloud = () =>
  shape(
    '<path d="M16 48C-3 48 0 25 16 27 11 6 44 2 46 26 67 20 71 49 49 48Z"/><path d="M18 30c0-12 18-15 22-6" fill="none" stroke="white" stroke-width="4"/>',
    blue,
  );
const camera = (color = pink) =>
  shape(
    `<path d="M7 18h11l4-8h18l4 8h13v35H7Z"/><rect x="10" y="21" width="44" height="7" fill="white" stroke="none"/><circle cx="33" cy="36" r="15" fill="${purple}"/><circle cx="33" cy="36" r="10" fill="${navy}"/><circle cx="29" cy="32" r="4" fill="white" stroke="none"/><rect x="47" y="22" width="6" height="5" fill="${yellow}"/>`,
    color,
  );
const bow = (color = pink) =>
  shape(
    '<path d="M29 27 8 9C0 10 1 49 10 50l20-14h4l20 14c9-1 10-40 2-41L35 27Z"/><path d="m28 35-12 23 15-4 7 5 6-22"/><rect x="26" y="24" width="13" height="15" rx="5"/>',
    color,
  );
const teddy = () =>
  shape(
    '<circle cx="15" cy="14" r="10"/><circle cx="49" cy="14" r="10"/><ellipse cx="32" cy="31" rx="24" ry="23"/><ellipse cx="32" cy="39" rx="13" ry="10" fill="#fff5e8"/><circle cx="22" cy="28" r="2" fill="#252044"/><circle cx="42" cy="28" r="2" fill="#252044"/><path d="m28 36 4 4 4-4Z" fill="#252044"/>',
    "#d9a06c",
  );
const rainbow = () =>
  `<path d="M8 48a24 24 0 0 1 48 0" fill="none" stroke="${navy}" stroke-width="14"/><path d="M8 48a24 24 0 0 1 48 0" fill="none" stroke="${pink}" stroke-width="10"/><path d="M12 48a20 20 0 0 1 40 0" fill="none" stroke="${yellow}" stroke-width="6"/><path d="M16 48a16 16 0 0 1 32 0" fill="none" stroke="${blue}" stroke-width="4"/><g transform="translate(0 34) scale(.4)">${cloud()}</g><g transform="translate(39 34) scale(.4)">${cloud()}</g>`;
function icon(name: string): string {
  if (name.includes("heart"))
    return name === "double-heart"
      ? `<g transform="translate(1 0) scale(.75)">${heart(purple)}</g><g transform="translate(20 18) scale(.68)">${heart()}</g>`
      : heart(
          name.includes("blue") ? blue : name.includes("lilac") ? purple : pink,
        );
  if (name.startsWith("star-"))
    return star(name.endsWith("blue") ? blue : yellow);
  if (name === "sparkle")
    return shape(
      '<path d="m32 3 8 21 21 8-21 8-8 21-8-21-21-8 21-8Z"/>',
      yellow,
    );
  if (name === "moon")
    return shape(
      '<path d="M43 5C13 1-5 39 20 55c15 10 34 0 37-14C27 51 12 18 43 5Z"/>',
      yellow,
    );
  if (name.startsWith("flower") || name === "daisy")
    return flower(
      name === "daisy" ? "#fff5e8" : name.endsWith("blue") ? blue : pink,
    );
  if (name === "tulip")
    return shape(
      '<path d="M31 60V33M31 51 12 38M31 48l20-12" stroke="#6eaa83" stroke-width="5" fill="none"/><path d="M14 7 26 16 32 5 40 16 52 7v19c0 22-39 22-38 0Z"/>',
    );
  if (name.startsWith("camera"))
    return camera(name.endsWith("blue") ? blue : pink);
  if (name.startsWith("bow") || name === "ribbon")
    return bow(name.includes("lilac") ? purple : pink);
  if (name === "cloud") return cloud();
  if (name === "rainbow") return rainbow();
  if (name === "cloud-love")
    return `${cloud()}<g transform="translate(22 2) scale(.37)">${heart()}</g>`;
  if (name === "cherries")
    return shape(
      '<path d="M17 41Q34 30 32 5M32 5q17 11 16 38" fill="none" stroke="#719b72" stroke-width="4"/><path d="M32 7C32-1 47-1 52 9 42 18 35 17 32 7" fill="#86bd89"/><circle cx="16" cy="45" r="13"/><circle cx="47" cy="47" r="13"/><path d="M9 39h4m27 2h4" stroke="white" stroke-width="4"/>',
    );
  if (name === "strawberry")
    return shape(
      '<path d="M9 20C2 34 24 59 32 60 40 59 64 33 55 20Z"/><path d="m10 20 14-3 8-12 7 12 16 3-15 9-8-6-9 6Z" fill="#93c899"/><g stroke="#ffe7ab" stroke-width="3"><path d="m18 33 2 2m12 4 1 2m12-8 2 2m-22 10 2 2m10 2 1 2"/></g>',
      "#fc7391",
    );
  if (name === "peach")
    return shape(
      '<path d="M32 20C1 1-8 45 26 58 58 64 78 17 48 15Z"/><path d="M32 20C38 31 26 39 31 53" fill="none" stroke="#df818c"/><path d="M29 18C20-1 51-1 53 9L32 20Z" fill="#9ccc94"/>',
      "#ffbcac",
    );
  if (name === "orange")
    return shape(
      '<circle cx="32" cy="36" r="24"/><path d="M31 15C28-5 53 0 53 10L32 18Z" fill="#89b789"/><path d="M17 29q-4 8 0 13" stroke="#ffe8bc" stroke-width="4" fill="none"/>',
      "#ffbd6f",
    );
  if (name === "planet")
    return shape(
      `<circle cx="32" cy="31" r="21"/><ellipse cx="32" cy="34" rx="31" ry="9" transform="rotate(-25 32 34)" fill="none" stroke="${pink}" stroke-width="5"/><circle cx="25" cy="23" r="5" fill="#dfceff" stroke="none"/>`,
      purple,
    );
  if (name === "controller")
    return shape(
      `<path d="M16 15h32c9 0 17 36 10 40-7 4-17-10-17-10H23S11 60 5 54C-1 47 7 15 16 15Z"/><path d="M14 24v15m-7-8h15" stroke="${navy}" stroke-width="5"/><circle cx="44" cy="27" r="4" fill="${pink}"/><circle cx="51" cy="36" r="4" fill="${blue}"/>`,
      "#b2dca2",
    );
  if (name === "crown")
    return shape(
      '<path d="M9 52 4 13l16 15L32 6l12 22 16-15-5 39Z"/><path d="M12 43h41" fill="none" stroke="#fff3c7" stroke-width="4"/><circle cx="32" cy="33" r="5" fill="#ff78b2"/>',
      yellow,
    );
  return teddy();
}
// Generated grids can contain isolated pixels from a neighboring cell. Keep the
// largest connected character, then give every frame the same transparent pad.
async function cleanSprite(input: Buffer, row: number) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const components: number[][] = [];
  for (let origin = 0; origin < visited.length; origin++) {
    if (visited[origin] || data[origin * 4 + 3] < 100) continue;
    const pixels = [origin];
    visited[origin] = 1;
    for (let cursor = 0; cursor < pixels.length; cursor++) {
      const p = pixels[cursor],
        x = p % width,
        y = Math.floor(p / width);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy,
            n = ny * width + nx;
          if (
            nx < 0 ||
            ny < 0 ||
            nx >= width ||
            ny >= height ||
            visited[n] ||
            data[n * 4 + 3] < 100
          )
            continue;
          visited[n] = 1;
          pixels.push(n);
        }
    }
    if (pixels.length > 500) components.push(pixels);
  }
  const characters = components
    .sort((a, b) => b.length - a.length)
    .slice(0, 9)
    .sort((a, b) => a[0] - b[0]);
  if (characters.length !== 9)
    throw new Error("Expected nine complete characters in each source column");
  const largest = characters[row];
  const keep = new Uint8Array(width * height);
  let left = width,
    top = height,
    right = 0,
    bottom = 0;
  for (const p of largest) {
    keep[p] = 1;
    const x = p % width,
      y = Math.floor(p / width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
  for (let p = 0; p < keep.length; p++) if (!keep[p]) data[p * 4 + 3] = 0;
  const small = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(56, 56, { fit: "contain", background: "#00000000" })
    .png()
    .toBuffer();
  return sharp(small)
    .resize(112, 112, { kernel: "nearest" })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: "#00000000" })
    .png()
    .toBuffer();
}
async function main() {
  for (const d of [
    "frames",
    "stickers",
    "text",
    "mascot",
    "backgrounds",
    "effects",
    "ui",
  ])
    await mkdir(`${root}/${d}`, { recursive: true });
  await mkdir("artwork/generated-svg", { recursive: true });
  const hero = await sharp("artwork/source/mascot-hero.png")
    .resize(640, 640, {
      fit: "contain",
      background: "#00000000",
      kernel: "nearest",
    })
    .png()
    .toBuffer();
  await writeFile(`${root}/mascot/hero.png`, hero);
  const spriteMeta = await sharp(
    "artwork/source/mascot-sprites.png",
  ).metadata();
  const states = [
    "idle",
    "walk",
    "talk",
    "happy",
    "surprise",
    "countdown",
    "cheer",
    "editing",
    "success",
  ];
  const animations: Record<string, unknown> = {};
  for (const [row, state] of states.entries()) {
    const frames = [];
    for (let col = 0; col < 4; col++) {
      const left = Math.round((col * spriteMeta.width!) / 4),
        right = Math.round(((col + 1) * spriteMeta.width!) / 4);
      let cell = await sharp("artwork/source/mascot-sprites.png")
        .extract({
          left,
          top: 0,
          width: right - left,
          height: spriteMeta.height!,
        })
        .png()
        .toBuffer();
      cell = await cleanSprite(cell, row);
      if (state === "countdown" && col < 3) {
        const pixels = await sharp(cell).ensureAlpha().raw().toBuffer();
        let x1 = 128,
          y1 = 128,
          x2 = 0,
          y2 = 0;
        for (let p = 0; p < 128 * 128; p++) {
          const [r, g, b, a] = pixels.subarray(p * 4, p * 4 + 4);
          if (a > 100 && b > 150 && b - r > 20 && b - g > 10) {
            const x = p % 128,
              y = Math.floor(p / 128);
            x1 = Math.min(x1, x);
            x2 = Math.max(x2, x);
            y1 = Math.min(y1, y);
            y2 = Math.max(y2, y);
          }
        }
        const textX = (x1 + x2) / 2,
          textY = (y1 + y2) / 2 + 10;
        cell = await sharp(cell)
          .composite([
            {
              input: svg(
                `<text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#252044" stroke="white" stroke-width="1">${3 - col}</text>`,
                128,
              ),
            },
          ])
          .png()
          .toBuffer();
      }
      frames.push({ input: cell, left: col * 128, top: 0 });
    }
    await sharp({
      create: { width: 512, height: 128, channels: 4, background: "#00000000" },
    })
      .composite(frames)
      .png()
      .toFile(`${root}/mascot/${state}.png`);
    animations[state] = {
      src: `/assets/mascot/${state}.png`,
      loop: state !== "countdown",
      frames: Array.from({ length: 4 }, (_, i) => ({
        x: i * 128,
        y: 0,
        width: 128,
        height: 128,
        duration: state === "walk" ? 130 : 220,
      })),
    };
  }
  await writeFile(
    `${root}/mascot/manifest.json`,
    JSON.stringify({ frameWidth: 128, frameHeight: 128, animations }, null, 2),
  );
  for (const name of STICKER_NAMES) {
    if (name.startsWith("pom-")) {
      const index = ["pom-camera", "pom-love", "pom-star", "pom-party"].indexOf(
        name,
      );
      const state = ["editing", "happy", "idle", "cheer"][index];
      const dog = await sharp(`${root}/mascot/${state}.png`)
        .extract({ left: 0, top: 0, width: 128, height: 128 })
        .resize(256, 256, { kernel: "nearest" })
        .png()
        .toBuffer();
      const extras =
        index === 1 ? heart() : index === 2 ? star() : index === 3 ? bow() : "";
      await sharp(dog)
        .composite(
          extras
            ? [
                {
                  input: await sharp(svg(extras))
                    .resize(66, 66, { kernel: "nearest" })
                    .toBuffer(),
                  top: 0,
                  left: 186,
                },
              ]
            : [],
        )
        .png()
        .toFile(`${root}/stickers/${name}.png`);
    } else {
      const source = svg(icon(name));
      await writeFile(`artwork/generated-svg/${name}.svg`, source);
      const raw = await sharp(source).png().toBuffer();
      await sharp(raw)
        .resize(256, 256, { kernel: "nearest" })
        .png()
        .toFile(`${root}/stickers/${name}.png`);
    }
  }
  for (const [i, word] of TEXT_STICKERS.entries()) {
    const color = [
      blue,
      pink,
      purple,
      yellow,
      blue,
      purple,
      pink,
      yellow,
      pink,
    ][i];
    const source = svg(
      `<g transform="translate(0 4)"><text x="256" y="118" font-family="Arial" font-weight="900" font-size="${word.length > 7 ? 73 : word.length > 5 ? 82 : 100}" text-anchor="middle" fill="${color}" stroke="${navy}" stroke-width="14" paint-order="stroke">${word}</text><text x="256" y="114" font-family="Arial" font-weight="900" font-size="${word.length > 7 ? 73 : word.length > 5 ? 82 : 100}" text-anchor="middle" fill="${color}" stroke="white" stroke-width="5" paint-order="stroke">${word}</text></g>`,
      512,
      180,
    );
    await writeFile(`artwork/generated-svg/text-${i}.svg`, source);
    await sharp(source)
      .png()
      .toFile(`public${textStickerSrc(word)}`);
  }
  for (const frame of FRAMES) {
    const art = await sharp(`artwork/source/frame-${frame.id}.png`)
      .resize(WIDTH, HEIGHT, { fit: "fill" })
      .png()
      .toBuffer();
    for (const layout of [1, 4, 6] as const) {
      const slots = frame.variants[layout].slots;
      const base = svg(
        `<defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2" fill="${frame.accent}" opacity=".2"/></pattern></defs><rect width="1024" height="1820" rx="16" fill="${frame.color}"/><rect width="1024" height="1820" fill="url(#dots)"/>${slots.map((s) => `<rect x="${s.x - 5}" y="${s.y - 5}" width="${s.width + 10}" height="${s.height + 10}" fill="none" stroke="${frame.accent}" stroke-width="4"/>`).join("")}`,
        WIDTH,
        HEIGHT,
      );
      const combined = await sharp(base)
        .composite([{ input: art }])
        .png()
        .toBuffer();
      const mask = svg(
        slots
          .map(
            (s) =>
              `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="white"/>`,
          )
          .join(""),
        WIDTH,
        HEIGHT,
      );
      await sharp(combined)
        .composite([{ input: mask, blend: "dest-out" }])
        .png()
        .toFile(`public${frame.variants[layout].src}`);
      await sharp(`public${frame.variants[layout].src}`)
        .resize(256, 455)
        .webp({ quality: 85, alphaQuality: 100 })
        .toFile(`public${frame.variants[layout].thumbnail}`);
    }
  }
  for (const bg of BACKGROUNDS)
    await sharp(`artwork/source/${bg}.png`)
      .resize(1920, 1080, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(`${root}/backgrounds/${bg}.webp`);
  let seed = 98423;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (const effect of EFFECTS.filter((e) => e.id !== "none")) {
    let body = "";
    if (effect.id === "flash")
      body =
        '<defs><radialGradient id="f"><stop stop-color="white" stop-opacity=".95"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="90" cy="80" r="140" fill="url(#f)"/><path d="M90 10v140M20 80h140" stroke="white" stroke-width="2" opacity=".8"/>';
    else if (effect.id === "grain" || effect.id === "noise") {
      for (let i = 0; i < 7000; i++) {
        const size = effect.id === "noise" ? 2 + Math.floor(random() * 4) : 1;
        body += `<rect x="${Math.floor(random() * 512)}" y="${Math.floor(random() * 512)}" width="${size}" height="${size}" fill="${random() > 0.5 ? "white" : "#252044"}" opacity="${effect.id === "noise" ? 0.16 : 0.12}"/>`;
      }
    } else {
      for (let i = 0; i < 20; i++) {
        const x = random() * 470,
          y = random() * 470,
          size = 14 + random() * 23;
        let decoration =
          effect.id === "hearts"
            ? heart()
            : effect.id === "stars"
              ? star()
              : effect.id === "petals"
                ? flower()
                : `<path d="M15 10 35 50" stroke="${[pink, blue, purple, yellow][i % 4]}" stroke-width="8"/>`;
        body += `<g transform="translate(${x} ${y}) rotate(${random() * 40 - 20}) scale(${size / 64})" opacity=".72">${decoration}</g>`;
      }
    }
    await sharp(svg(body, 512))
      .png()
      .toFile(`${root}/effects/${effect.id}.png`);
  }
  const ui = {
    camera: camera(),
    heart: heart(),
    star: star(),
    flower: flower(),
    cloud: cloud(),
    bow: bow(),
    "speech-bubble": shape('<path d="M5 8h54v36H28L16 58V44H5Z"/>', "#fff5e8"),
  };
  for (const [name, body] of Object.entries(ui))
    await writeFile(`${root}/ui/${name}.svg`, svg(body));
  for (const [i, label] of [
    "START",
    "CAPTURE",
    "DOWNLOAD",
    "BACK",
    "NEXT",
  ].entries())
    await writeFile(
      `${root}/ui/${label.toLowerCase()}.svg`,
      svg(
        `<rect x="4" y="4" width="232" height="58" rx="8" fill="${[pink, purple, blue, "#fff5e8", pink][i]}" stroke="${navy}" stroke-width="4"/><path d="M14 11h208" stroke="white" stroke-width="3" opacity=".7"/><text x="120" y="41" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="24" fill="${i === 3 ? navy : "white"}">${label}</text>`,
        240,
        68,
      ),
    );
  for (let i = 1; i <= 3; i++)
    await writeFile(
      `${root}/ui/countdown-${i}.svg`,
      svg(
        `<circle cx="32" cy="32" r="28" fill="${navy}" stroke="${purple}" stroke-width="3"/><text x="32" y="45" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="white">${i}</text>`,
      ),
    );
  await writeFile(
    `${root}/manifest.json`,
    JSON.stringify(
      {
        canvas: { width: WIDTH, height: HEIGHT },
        frames: FRAMES,
        stickers: STICKER_NAMES.map((id) => ({
          id,
          src: `/assets/stickers/${id}.png`,
        })),
        text: TEXT_STICKERS.map((text) => ({
          text,
          src: textStickerSrc(text),
        })),
        backgrounds: BACKGROUNDS.map((id) => ({
          id,
          src: `/assets/backgrounds/${id}.webp`,
        })),
        effects: EFFECTS.filter((e) => e.id !== "none").map((e) => ({
          ...e,
          src: `/assets/effects/${e.id}.png`,
        })),
      },
      null,
      2,
    ),
  );
  console.log(
    `Built: ${FRAMES.length * 3} frames, 32 stickers, 9 text stickers, 9 animated sprite sheets, 4 backgrounds, 7 effects and SVG UI assets.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
