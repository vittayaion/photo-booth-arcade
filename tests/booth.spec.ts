import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import type Konva from "konva";
import { FRAMES, type Layout } from "../src/features/frames/catalog";

for (const [id, layout] of [
  ["kitty", 1],
  ["kuromi", 4],
  ["tanjiro", 6],
  ["zenitsu", 4],
  ["inosuke", 6],
] as const) {
  test(`anime frame ${id}: selection, photo slots and full-resolution export`, async ({
    page,
  }) => {
    const frame = FRAMES.find((f) => f.id === id)!;
    await page.goto("/");
    await page.getByRole("button", { name: /Anime Collection/ }).click();
    await page
      .getByRole("button", { name: `เลือกกรอบ ${frame.name}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: `${layout} ช่อง`, exact: true })
      .click();
    await page.getByRole("button", { name: "START GAME" }).click();
    await expect(page).toHaveURL(/camera/);
    await page
      .getByTestId("photo-upload")
      .setInputFiles(
        await Promise.all(
          Array.from({ length: layout }, () => fixture("#aaccff")),
        ),
      );
    await page.getByRole("button", { name: "ไปตกแต่งรูป" }).click();
    await page.getByRole("button", { name: "PREVIEW", exact: true }).click();
    const preview = page.getByAltText("ภาพสำเร็จของคุณ");
    await expect(preview).toBeVisible();
    const bytes = Buffer.from(
      await preview.evaluate(async (img: HTMLImageElement) =>
        Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer())),
      ),
    );
    const meta = await sharp(bytes).metadata();
    expect([meta.width, meta.height]).toEqual([1024, 1820]);
    for (const slot of frame.variants[layout as Layout].slots) {
      const pixel = await sharp(bytes)
        .extract({ left: slot.x + 5, top: slot.y + 5, width: 1, height: 1 })
        .removeAlpha()
        .raw()
        .toBuffer();
      expect(Array.from(pixel)).toEqual([170, 204, 255]);
    }
    // A footer patch proves the selected theme's actual full-size artwork is exported.
    const area = { left: 490, top: 1680, width: 20, height: 20 };
    const expected = await sharp(`public${frame.variants[layout].src}`)
      .flatten({ background: frame.color })
      .extract(area)
      .removeAlpha()
      .raw()
      .toBuffer();
    const actual = await sharp(bytes)
      .extract(area)
      .removeAlpha()
      .raw()
      .toBuffer();
    expect(
      Array.from(actual).every((v, i) => Math.abs(v - expected[i]) <= 2),
    ).toBe(true);
    await sharp(bytes).toFile(`artwork/qa/export-${id}.png`);
  });
}

async function selectedNode(page: Page) {
  return page.evaluate(() => {
    const stage = (window as unknown as { Konva: typeof Konva }).Konva
      .stages[0];
    const transformer = stage.findOne("Transformer") as Konva.Transformer;
    const node = transformer.nodes()[0];
    const rect = stage.container().getBoundingClientRect();
    const point = (p: { x: number; y: number }) => ({
      x: p.x + rect.x,
      y: p.y + rect.y,
    });
    return {
      x: node.x(),
      y: node.y(),
      width: node.width(),
      rotation: node.rotation(),
      center: point(
        node
          .getAbsoluteTransform()
          .point({ x: node.width() / 2, y: node.height() / 2 }),
      ),
      resize: point(
        transformer.findOne(".bottom-right")!.getAbsolutePosition(),
      ),
      rotate: point(transformer.findOne(".rotater")!.getAbsolutePosition()),
    };
  });
}
const fixture = async (color: string) => ({
  name: `${color}.png`,
  mimeType: "image/png",
  buffer: await sharp({
    create: { width: 800, height: 600, channels: 3, background: color },
  })
    .png()
    .toBuffer(),
});
async function start(page: Page, layout: 1 | 4 | 6 = 4) {
  await page.goto("/");
  await page
    .getByRole("button", { name: `${layout} ช่อง`, exact: true })
    .click();
  await page.getByRole("button", { name: "START GAME" }).click();
  await expect(page).toHaveURL(/camera/);
}
async function upload(page: Page, layout: 1 | 4 | 6 = 4) {
  await start(page, layout);
  await page
    .getByTestId("photo-upload")
    .setInputFiles(
      await Promise.all(
        Array.from({ length: layout }, (_, i) =>
          fixture(
            ["#eeaacc", "#aaccff", "#ffeeaa", "#bbeebb", "#ccaaff", "#ffbb99"][
              i
            ],
          ),
        ),
      ),
    );
  await expect(page.getByRole("button", { name: "ไปตกแต่งรูป" })).toBeEnabled();
}
test("home: assets load, all themes and mobile layouts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SAY CHEESE, HOOMAN!" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /เลือกกรอบ / })).toHaveCount(
    15,
  );
  await page.evaluate(() =>
    Promise.all(Array.from(document.images).map((img) => img.decode())),
  );
  expect(
    await page.evaluate(() =>
      Array.from(document.images).every((i) => i.naturalWidth > 0),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Anime Collection/ }).click();
  await expect(page.getByRole("button", { name: /เลือกกรอบ / })).toHaveCount(5);
  for (const layout of [1, 4, 6]) {
    await page
      .getByRole("button", { name: `${layout} ช่อง`, exact: true })
      .click();
    await page.evaluate(() =>
      Promise.all(Array.from(document.images).map((img) => img.decode())),
    );
    await expect(page.locator(".frame-grid .strip-slot")).toHaveCount(
      5 * layout,
    );
  }
  await page.getByRole("button", { name: "4 ช่อง", exact: true }).click();
  await page
    .locator(".frame-section")
    .screenshot({ path: "artwork/qa/anime-collection.png" });
  await page.getByRole("button", { name: /Pom & Friends/ }).click();
  await expect(page.getByRole("button", { name: /เลือกกรอบ / })).toHaveCount(
    10,
  );
  await page.getByRole("button", { name: /ทั้งหมด/ }).click();
  await mkdir("artwork/qa", { recursive: true });
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      page.getByRole("button", { name: "START GAME" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artwork/qa/home-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
test("continuous camera, cancellation, four shots and retake", async ({
  page,
}) => {
  await start(page, 4);
  const capture = page.getByRole("button", { name: "CAPTURE", exact: true });
  await expect(capture).toBeEnabled();
  await capture.click();
  await expect(page.locator(".countdown")).toBeVisible();
  await page.getByRole("button", { name: "CANCEL" }).click();
  await expect(page.locator(".countdown")).toHaveCount(0);
  await expect(capture).toBeEnabled();
  await capture.click();
  await expect(page.getByRole("button", { name: "ไปตกแต่งรูป" })).toBeEnabled({
    timeout: 25000,
  });
  await expect(page.locator(".shot-selectors button img")).toHaveCount(4);
  const old = await page
    .locator(".shot-selectors button img")
    .nth(1)
    .getAttribute("src");
  await page.getByRole("button", { name: "เลือกถ่ายซ้ำช่อง 2" }).click();
  await page.getByRole("button", { name: "RETAKE", exact: true }).click();
  await expect(page.getByRole("button", { name: "ไปตกแต่งรูป" })).toBeEnabled({
    timeout: 10000,
  });
  expect(
    await page.locator(".shot-selectors button img").nth(1).getAttribute("src"),
  ).not.toBe(old);
});
for (const layout of [1, 6] as const)
  test(`camera captures ${layout} slots`, async ({ page }) => {
    await start(page, layout);
    await expect(
      page.getByRole("button", { name: "CAPTURE", exact: true }),
    ).toBeEnabled();
    const crop = await page.locator(".live-crop").boundingBox();
    expect(crop!.width / crop!.height).toBeCloseTo(
      layout === 1 ? 864 / 1428 : 420 / 460,
      2,
    );
    await page.getByRole("button", { name: "CAPTURE", exact: true }).click();
    await expect(page.getByRole("button", { name: "ไปตกแต่งรูป" })).toBeEnabled(
      { timeout: 35000 },
    );
    await expect(page.locator(".shot-selectors button img")).toHaveCount(
      layout,
    );
  });
test("editor history, text, PNG export parity and navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  const posted: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posted.push(request.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await upload(page, 4);
  await page.getByRole("button", { name: "ไปตกแต่งรูป" }).click();
  await expect(
    page.getByTestId("composition").locator("canvas").first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "เพิ่มสติกเกอร์ heart-pink", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page.getByRole("button", { name: "ข้อความ", exact: true }).click();
  await page.getByLabel("เขียนอะไรน่ารัก ๆ").fill("วันดี ๆ ของเรา ♡");
  await page.getByRole("button", { name: "เพิ่มข้อความ", exact: true }).click();
  await page.getByRole("button", { name: "Edit text", exact: true }).click();
  await page.getByLabel("แก้ไขข้อความของคุณ").fill("ปอมปอม BESTIE");
  await page
    .getByRole("button", { name: "บันทึกข้อความ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "PREVIEW", exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: "artwork/qa/editor-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "PREVIEW", exact: true }).click();
  await expect(page).toHaveURL(/preview/);
  const preview = page.getByAltText("ภาพสำเร็จของคุณ");
  await expect(preview).toBeVisible();
  const previewData = await preview.evaluate(async (img: HTMLImageElement) =>
    Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer())),
  );
  const meta = await sharp(Buffer.from(previewData)).metadata();
  expect([meta.width, meta.height]).toEqual([1024, 1820]);
  for (const [i, rgb] of [
    [238, 170, 204],
    [170, 204, 255],
    [255, 238, 170],
    [187, 238, 187],
  ].entries()) {
    const pixel = await sharp(Buffer.from(previewData))
      .extract({ left: 100, top: 180 + i * 363, width: 1, height: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    expect(Array.from(pixel)).toEqual(rgb);
  }
  await page.getByRole("button", { name: "กลับไปเติมความคิวท์" }).click();
  await expect(page).toHaveURL(/editor/);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeEnabled();
  await page.getByTestId("composition").click({ position: { x: 4, y: 4 } });
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "PREVIEW", exact: true }).click();
  await page.getByRole("button", { name: "PRINT MY MEMORY" }).click();
  await expect(page).toHaveURL(/result/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD PNG" }).click();
  const file = await download;
  const path = await file.path();
  expect(path).toBeTruthy();
  const bytes = await readFile(path!);
  expect(bytes.equals(Buffer.from(previewData))).toBe(true);
  await page.screenshot({
    path: "artwork/qa/result-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(posted).toEqual([]);
});
test("mouse drag, resize and rotate commit correctly and support undo", async ({
  page,
}) => {
  await upload(page, 1);
  await page.getByRole("button", { name: "ไปตกแต่งรูป" }).click();
  await page
    .getByRole("button", { name: "เพิ่มสติกเกอร์ heart-pink", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "PREVIEW", exact: true }),
  ).toBeEnabled();
  let before = await selectedNode(page);
  await page.mouse.move(before.center.x, before.center.y);
  await page.mouse.down();
  await page.mouse.move(before.center.x + 30, before.center.y + 25, {
    steps: 8,
  });
  await page.mouse.up();
  expect((await selectedNode(page)).x).toBeGreaterThan(before.x + 20);
  before = await selectedNode(page);
  await page.mouse.move(before.resize.x, before.resize.y);
  await page.mouse.down();
  await page.mouse.move(before.resize.x + 24, before.resize.y + 24, {
    steps: 8,
  });
  await page.mouse.up();
  expect((await selectedNode(page)).width).toBeGreaterThan(before.width + 20);
  before = await selectedNode(page);
  const dx = before.rotate.x - before.center.x,
    dy = before.rotate.y - before.center.y;
  await page.mouse.move(before.rotate.x, before.rotate.y);
  await page.mouse.down();
  await page.mouse.move(
    before.center.x + dx * 0.707 - dy * 0.707,
    before.center.y + dx * 0.707 + dy * 0.707,
    { steps: 10 },
  );
  await page.mouse.up();
  expect(Math.abs((await selectedNode(page)).rotation)).toBeGreaterThan(20);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  // Undo intentionally clears selection; reselect the sticker to inspect its rotation.
  await page.mouse.click(before.center.x, before.center.y);
  expect(Math.abs((await selectedNode(page)).rotation)).toBeLessThan(1);
});
test("permission denied still supports upload and corrupt files", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () =>
        Promise.reject(
          new DOMException("Permission denied", "NotAllowedError"),
        ),
    });
  });
  await start(page, 1);
  await expect(
    page.getByText("กล้องยังไม่พร้อม", { exact: true }),
  ).toBeVisible();
  await page.getByTestId("photo-upload").setInputFiles({
    name: "bad.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "อ่านไม่ได้" }),
  ).toBeVisible();
  await page
    .getByTestId("photo-upload")
    .setInputFiles(await fixture("#aaccff"));
  await expect(page.getByRole("button", { name: "ไปตกแต่งรูป" })).toBeEnabled();
});
test("mobile editor touch drag and export six images", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    permissions: ["camera"],
  });
  const page = await context.newPage();
  await upload(page, 6);
  await page.getByRole("button", { name: "ไปตกแต่งรูป" }).click();
  await page
    .getByRole("button", { name: "เพิ่มสติกเกอร์ star-yellow", exact: true })
    .tap();
  await page.getByTestId("composition").scrollIntoViewIfNeeded();
  const before = await selectedNode(page);
  const canvas = page.getByTestId("composition").locator("canvas").first();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  const session = await context.newCDPSession(page);
  const x = box!.x + box!.width * 0.5,
    y = box!.y + box!.height * 0.49;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 25, y: y + 25 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect((await selectedNode(page)).x).toBeGreaterThan(before.x + 20);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artwork/qa/editor-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "PREVIEW", exact: true }).tap();
  await expect(page).toHaveURL(/preview/);
  await expect(page.getByAltText("ภาพสำเร็จของคุณ")).toBeVisible();
  await context.close();
});
test("direct routes redirect without a session", async ({ page }) => {
  for (const path of ["/camera", "/editor", "/preview", "/result"]) {
    await page.goto(path);
    await expect(page).toHaveURL("http://localhost:3000/");
  }
});
