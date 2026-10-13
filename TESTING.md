# Verification — 13 October 2026

## Passed checks

| Check                                             | Result                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| TypeScript strict (`pnpm typecheck`)              | Passed                                          |
| Next.js production build (`pnpm build`)           | Passed; all five application routes prerendered |
| Asset validation (`pnpm assets:check`)            | Passed                                          |
| Playwright / Google Chrome headless (`pnpm test`) | 14 passed, approximately 1.5 minutes             |

## Asset verification

- 45 PNG frame variants at exactly 1024 × 1820; every pixel inside all 165 photo slots has alpha=0.
- 45 WebP frame thumbnails at 256 × 455, retaining alpha. Home/Camera previews use thumbnails and Export uses the full PNG.
- 32 separate sticker PNGs, 9 text-sticker PNGs, and 7 effect overlays: visible artwork plus true transparent pixels.
- 9 mascot sprite sheets, each 512 × 128 with four 128 × 128 frames; animation metadata stays within sheet bounds.
- Generated sprite source inspected visually. Replaced naive grid cropping with alpha-component extraction so the character's ears and tail remain intact and adjacent rows do not leak into frames.
- 4 WebP backgrounds at 1920 × 1080 and 15 SVG UI assets.
- All fifteen frames and the mascot sprite states inspected visually. Anime cutouts leave the characters’ heads and ears intact; the five themed exports also match their original frame footer pixels.

## Browser scenarios

1. Home: all fifteen themes and collection filters, successful image decoding, no horizontal overflow at 375/768/1440 px.
2. Four-photo sequence: real three-second timers against a fake MediaDevices stream, cancellation, continuous capture, and replacing only the selected slot.
3. One-photo capture: successful capture and live preview aspect ratio matching the export slot.
4. Six-photo capture: six distinct shots and matching slot aspect ratio.
5. Editor and export: duplicate/delete, Undo/Redo, Thai/English text editing, back navigation preserving work, PNG dimensions, known photo pixels, and a downloaded PNG byte-identical to Preview. Export remains identical after clearing selection. No POST requests occurred during the photo/edit/export flow.
6. Mouse gestures: actual drag, corner resize, rotation-handle drag, and Undo restoring the previous rotation.
7. Permission denial and corrupt upload: understandable fallback UI and a successful valid upload afterward.
8. Mobile: six uploads, actual touch drag changing the selected object's position, no overflow, and successful Preview export.
9. Direct navigation: missing session data redirects safely to Home.
10–14. Five Anime themes: collection selection, upload, export dimensions, every filled slot pixel and exported footer matching the selected full-resolution frame.

Browser screenshots are saved under `artwork/qa/` for Home (three widths), desktop/mobile Editor, and Result. Solid-color images used in tests are private test fixtures created in memory; they are not embedded in frame assets.

## Not verified on hardware

## Vercel production smoke check — 13 October 2026

Production URL: https://photo-booth-arcade.vercel.app

- Vercel cloud build and TypeScript completed successfully using Node.js 24.x and pnpm 10.32.1.
- Public HTTPS URL returns HTTP 200 without authentication; secure-context MediaDevices is available.
- Headless Chrome loaded all 15 frame previews, captured a photo with the simulated camera, replaced it with an uploaded test image, added a sticker, and exported/downloaded a 1024 × 1820 PNG.
- The uploaded image's pixel was verified in the exported PNG; the downloaded PNG was byte-identical to Preview.
- No page errors or POST requests during this flow; no horizontal overflow at 375 px.

## Hardware verification limits

- A physical webcam and its OS/browser permission dialog.
- Physical iOS/Android devices and Safari/WebKit behavior.
- Mobile camera access through LAN: requires HTTPS; localhost camera checks were performed on the development computer.

The tests deliberately use Chromium's fake media stream and do not silently activate a physical camera.

## Local execution notes

The final browser run uses a dedicated production server on port 3100 with `reuseExistingServer: false`. This avoids silently testing against an existing development server on port 3000.

The first sandboxed Turbopack build stalled and was stopped. The approved build outside the sandbox completed successfully. The TypeScript asset runner also needed approved local IPC access. These are execution-environment permissions, not application build failures; subsequent production builds, asset checks, and browser tests passed.
