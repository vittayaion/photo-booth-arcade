export type Layout = 1 | 4 | 6;
export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface FrameDefinition {
  id: string;
  name: string;
  thai: string;
  color: string;
  accent: string;
  tag: string;
  variants: Record<
    Layout,
    { src: string; thumbnail: string; slots: PhotoSlot[] }
  >;
}
export const WIDTH = 1024;
export const HEIGHT = 1820;
export const slotsFor = (layout: Layout, anime = false): PhotoSlot[] =>
  anime
    ? Array.from({ length: layout }, (_, i) => {
        const columns = layout === 6 ? 2 : 1;
        const rows = layout / columns;
        const width = (832 - (columns - 1) * 24) / columns;
        const height = (1116 - (rows - 1) * 24) / rows;
        return {
          x: 96 + (i % columns) * (width + 24),
          y: 220 + Math.floor(i / columns) * (height + 24),
          width,
          height,
        };
      })
    : layout === 1
      ? [{ x: 80, y: 160, width: 864, height: 1428 }]
      : Array.from({ length: layout }, (_, i) =>
          layout === 4
            ? { x: 80, y: 160 + i * 363, width: 864, height: 339 }
            : {
                x: 80 + (i % 2) * 444,
                y: 160 + Math.floor(i / 2) * 484,
                width: 420,
                height: 460,
              },
        );
const definitions = [
  [
    "pomeranian",
    "Kawaii Pomeranian",
    "ปอมปอมเลิฟเวอร์",
    "#ffe4f0",
    "#FF78B2",
    "FAN FAVORITE",
  ],
  ["teddy", "Teddy Bear", "อ้อมกอดเท็ดดี้", "#fff0d7", "#cc8c52", "COZY"],
  ["film", "Film Camera", "ความทรงจำบนฟิล์ม", "#292537", "#c4c0b9", "CLASSIC"],
  ["rainbow", "Rainbow", "วันที่มีสายรุ้ง", "#dff4ff", "#8DDCFF", "DREAMY"],
  [
    "galaxy",
    "Pixel Galaxy",
    "ท่องจักรวาลพิกเซล",
    "#272449",
    "#B9A5FF",
    "COSMIC",
  ],
  ["y2k", "Y2K", "ย้อนยุคสุดคิวท์", "#f4d9ff", "#dc8bef", "TRENDING"],
  ["floral", "Floral", "สวนดอกไม้ของเรา", "#f4f2d9", "#90b997", "SOFT"],
  ["notebook", "Notebook", "บันทึกวันดี ๆ", "#fff4e4", "#ffb69d", "MEMORIES"],
  ["bear", "Minimal Bear", "หมีน้อยมินิมอล", "#f6ead7", "#ad8b70", "MINIMAL"],
  [
    "retro",
    "Retro Arcade",
    "เกมแห่งความทรงจำ",
    "#282342",
    "#ffe57e",
    "PLAYFUL",
  ],
  [
    "kitty",
    "Hello Kitty",
    "โบว์แดงกับวันหวาน ๆ",
    "#fff0f3",
    "#ed577d",
    "ANIME",
  ],
  ["kuromi", "Kuromi", "คิวท์แบบตัวแสบ", "#e9ddfa", "#8f6bc2", "ANIME"],
  [
    "tanjiro",
    "Tanjiro & Nezuko",
    "สายสัมพันธ์แห่งซากุระ",
    "#153c35",
    "#f5a7be",
    "ANIME",
  ],
  ["zenitsu", "Zenitsu", "ประกายสายฟ้าสีทอง", "#342b22", "#ffc648", "ANIME"],
  ["inosuke", "Inosuke", "ผจญภัยกับเจ้าหมูป่า", "#24374d", "#75c5ef", "ANIME"],
];
export const FRAMES: FrameDefinition[] = definitions.map(
  ([id, name, thai, color, accent, tag]) => ({
    id,
    name,
    thai,
    color,
    accent,
    tag,
    variants: Object.fromEntries(
      ([1, 4, 6] as const).map((layout) => [
        layout,
        {
          src: `/assets/frames/${id}-${layout}.png`,
          thumbnail: `/assets/frames/${id}-${layout}-thumb.webp`,
          slots: slotsFor(layout, tag === "ANIME"),
        },
      ]),
    ) as FrameDefinition["variants"],
  }),
);
export const getFrame = (id: string) =>
  FRAMES.find((f) => f.id === id) ?? FRAMES[0];
export const BACKGROUNDS = ["arcade", "night", "dream", "clouds"] as const;
export const EFFECTS = [
  { id: "none", name: "Original" },
  { id: "flash", name: "Flash" },
  { id: "hearts", name: "Hearts" },
  { id: "stars", name: "Stars" },
  { id: "confetti", name: "Confetti" },
  { id: "petals", name: "Petals" },
  { id: "grain", name: "Film grain" },
  { id: "noise", name: "Pixel noise" },
] as const;
export type EffectId = (typeof EFFECTS)[number]["id"];
export const STICKER_NAMES = [
  "pom-camera",
  "pom-love",
  "pom-star",
  "pom-party",
  "heart-pink",
  "heart-blue",
  "heart-lilac",
  "double-heart",
  "star-yellow",
  "star-blue",
  "sparkle",
  "moon",
  "flower-pink",
  "flower-blue",
  "daisy",
  "tulip",
  "camera-pink",
  "camera-blue",
  "bow-pink",
  "bow-lilac",
  "ribbon",
  "cloud",
  "rainbow",
  "cloud-love",
  "cherries",
  "strawberry",
  "peach",
  "orange",
  "planet",
  "controller",
  "crown",
  "teddy",
] as const;
export const TEXT_STICKERS = [
  "GOOD DAY",
  "LOVE",
  "BESTIE",
  "HAPPY",
  "SMILE",
  "CUTE",
  "NICE!",
  "GAME ON",
  "YAY!",
] as const;
export const stickerSrc = (name: string) => `/assets/stickers/${name}.png`;
export const textStickerSrc = (name: string) =>
  `/assets/text/${name
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/-$/, "")}.png`;
