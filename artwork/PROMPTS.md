# Artwork provenance and generation prompts

Generated for this project with the connected **built-in Image Generation tool**. No API key, CLI image model, stock photo download, or source reference infographic was used as a production asset. Original generated PNGs are retained in `artwork/source/`.

The 21 source images are: one hero mascot, one 36-frame animation sheet, fifteen outer-frame illustrations, and four scene backgrounds. Production processing is reproducible with `pnpm assets:build`.

## Hero mascot (`mascot-hero.png`, transparent_background=true)

Use case: stylized-concept. Asset type: production pixel art game mascot, single transparent PNG cutout. Create ONE adorable fluffy white and orange Pomeranian dog, whole body, front three-quarter facing slightly right, holding a small lavender and pink instant camera. White fluffy round body and cheeks, orange ears forehead and back, very short legs, curled fluffy tail, black round sparkling eyes, rosy pink cheeks, small pink tongue, pink bandana with a tiny yellow heart. Faithful clean 2D Japanese kawaii pixel art, crisp square pixels and stair-stepped dark navy outline, limited pastel palette pink #FF78B2 lavender #B9A5FF sky #8DDCFF cream #FFF5E8 navy #252044. Large clear readable silhouette, balanced centered composition, paws and tail fully visible, use most of square canvas with 8% transparent padding. Actual alpha transparency, no background, no floor, no lettering, no grid, no checkerboard, no people, no cats. This is original reusable artwork for a Pomeranian photo booth arcade website.

## Sprite sheet (`mascot-sprites.png`, transparent_background=true)

A production sprite sheet on actual transparent background. Exactly 4 columns and 9 rows in a uniform grid, 36 square cells, no lines, no labels, no text. Each cell has one same adorable fluffy white-orange Pomeranian dog: orange forehead ears and back, white cheeks round body, short legs, curled fluffy tail, black round eyes, pink cheeks tongue and pink neckerchief. Crisp 2D pixel art with navy outlines and pastel kawaii colors. All cells same fixed camera and scale, full body inside cell with generous transparent padding. Each ROW is a four-frame animation: row1 idle breathing blink; row2 walking cycle; row3 talking mouth open close; row4 happy bouncing; row5 surprised eyes open and paws up; row6 holding a blank blue countdown placard; row7 cheer waving pink pompoms; row8 editing holding a tiny lavender camera; row9 success celebrating with a photo strip. Maintain absolutely consistent character identity. No numbers on placard, no grid, no background, no shadows outside cells. Intended final layout 512 pixels wide by 1152 pixels tall, uniform 128px cells.

The generated source does not have perfectly uniform row spacing. The builder finds the nine largest connected alpha components in each column, orders them vertically, isolates the complete character, and normalizes each to a padded 128 × 128 frame. Numbers 3/2/1 are added to the blue sign deterministically. The final runtime metadata describes the actual normalized frames.

## Outer frames (`frame-<id>.png`, transparent_background=true)

Each theme was a separate generation call using this template, with `{theme}` replaced by the text below:

> Production photo booth decorative outer frame artwork. Portrait aspect ratio 1024:1820. Theme: {theme}. Beautiful clean 2D kawaii pixel art with crisp stepped outlines, pastel accents. A decorative rectangular paper border only: top header band 9 percent height, bottom footer band 13 percent height, left and right side borders only 8 percent width each. The ENTIRE large central rectangle is actual transparent alpha, no objects, no photos, no placeholders, no checkerboard. All cute illustrations contained in the margins, larger detailed illustrations in bottom corners and top corners. No interior dividers because photo slots are added by code later. No people. NO TEXT, NO LETTERING. High quality charming collectible Japanese purikura stationery border. Whole frame visible with no cropped edges.

| ID         | Theme prompt                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| pomeranian | white-orange fluffy Pomeranian dogs, pink hearts, little pixel paws, pink gingham, lavender ribbons                                |
| teddy      | honey brown teddy bears, cream gingham, small orange hearts, apricot daisies                                                       |
| film       | black and cream analog photographic film border, white square film perforations down both sides, a silver vintage camera at bottom |
| rainbow    | pastel rainbows arching over the top, blue sky, white puffy clouds and golden stars                                                |
| galaxy     | dark midnight navy, purple ringed planets, crescent moon, lilac stars and tiny comets                                              |
| y2k        | pink and lilac Y2K chrome hearts, butterflies, pixel music player, iridescent bows                                                 |
| floral     | cream paper, green botanical vines down the edges, white daisies and pink flowers                                                  |
| notebook   | cream notebook paper, peach grid lines, washi tape, tiny red hearts, pink pencil and lavender paperclips                           |
| bear       | minimal cream and oatmeal paper, tiny brown bear faces, sparse orange heart doodles                                                |
| retro      | dark navy Japanese retro arcade game cabinet border, pixel hearts, yellow stars and colorful little game controller at bottom      |

Exact slot geometry is applied after generation with a `dest-out` alpha mask using the shared catalog. The source art is never trusted to define the photo cutouts. Production frames have been checked pixel by pixel for fully transparent slots.

## Backgrounds (`transparent_background=false`)

### `arcade.png`

Wide background artwork, 16:9 composition, pastel Japanese kawaii pixel art photo booth arcade interior. A pink and lavender vintage photo booth centered, blank dark photo booth screen, tiny orange white Pomeranian paw decorations, vending machines to the sides, tiled cream floor, pixel sparkles, soft lavender room lighting. Polished 2D game environment with clean stepped pixels, dark navy outlines, pink #FF78B2 lavender #B9A5FF sky #8DDCFF cream #FFF5E8. No people, no readable lettering, no collage, no borders. Quiet airy background with low contrast center for UI overlay.

### Additional scene template

> Wide 16:9 production background artwork for a kawaii Japanese pixel arcade photo booth website: {scene}. Original beautiful crisp 2D pixel art, detailed but calm composition, clean square pixel edges and pastel highlights, coherent palette #FF78B2 #B9A5FF #8DDCFF #FFF5E8 #252044. Leave calm center for UI. No people, no text, no labels, no watermark, not an infographic, a single immersive environment.

- `night.png`: a midnight navy and violet Japanese photo booth arcade with neon pink cabinets, glowing blue floor tiles and pixel stars
- `dream.png`: a dreamy pastel pink photo booth arch surrounded by peach clouds, golden stars, heart shaped lamps, soft lavender sky
- `clouds.png`: a clear sky blue and cream fluffy cloud world, a little floating pastel pink photo booth, tiny yellow pixel stars and a rainbow

## Programmatic artwork

The 28 simple decorative sticker designs are original SVG paths rasterized at 64 px and enlarged with nearest-neighbor sampling to 256 px for pixel edges. Four Pomeranian stickers derive from the AI sprite sheet and optional vector decoration. Nine text stickers use exact font-rendered lettering, not AI-generated spelling. Seven camera-effect overlays use deterministic SVG patterns and a seeded random generator. UI buttons/icons are SVG/CSS so they remain scalable.

These programmatic assets are identified as such; they are not represented as AI-generated images.

## Anime collection (13 October 2026)

Five separate calls with `transparent_background=true`. The reference was used as visual guidance, never as a production image. These are generated fan-art illustrations; character names identify the designs, not an official collaboration.

### `frame-kitty.png`

Create a single beautiful production photobooth OUTER FRAME, portrait 1024:1820 aspect. Original polished 2D cel shaded anime collectible stationery artwork, detailed crisp ink outlines, luminous color, carefully designed balanced border. THEME: Hello Kitty, adorable white cat with red bow, red and pink strawberry gingham, glossy cherry-red ribbon bows, tiny strawberry blossoms, pearl hearts. One large sitting Hello Kitty in the bottom footer and one little face in the top header. Pink cream and red palette. IMPORTANT GEOMETRY: keep all character heads and main decorations entirely inside TOP 8% and BOTTOM 12% header/footer bands. Side rails only 7% of image width each, slender decorative motifs there. Entire central rectangle from x8% to92% and y9% to87% must be empty real alpha transparency. NO interior divisions, NO photographs, NO checkerboard, NO grid background, NO letters, NO text, NO watermark. This is one finished illustrated rectangular outer frame with large transparent center. Whole outer frame visible with padding. Corners ornate but never obstruct center. Genuine alpha background.

### `frame-kuromi.png`

Create a single beautiful production photobooth OUTER FRAME, portrait 1024:1820 aspect. Original polished 2D cel shaded anime collectible stationery artwork, detailed crisp ink outlines, luminous color, carefully designed balanced border. THEME: Kuromi, black pointed jester hood with a pink skull, adorable white face, mischievous smile, lavender gothic lace, black satin bows, violet roses, tiny pastel bat wings and crescent moons. One large Kuromi in bottom footer, small Kuromi in top header. Black lilac and pink palette. IMPORTANT GEOMETRY: keep all character heads and main decorations entirely inside TOP 8% and BOTTOM 12% header/footer bands. Side rails only 7% of image width each, slender decorative motifs there. Entire central rectangle from x8% to92% and y9% to87% must be empty real alpha transparency. NO interior divisions, NO photographs, NO checkerboard, NO grid background, NO letters, NO text, NO watermark. This is one finished illustrated rectangular outer frame with large transparent center. Whole outer frame visible with padding. Corners ornate but never obstruct center. Genuine alpha background.

### `frame-tanjiro.png`

Create a single beautiful production photobooth OUTER FRAME, portrait 1024:1820 aspect. Original polished 2D cel shaded anime collectible stationery artwork, detailed crisp ink outlines, luminous color, carefully designed balanced border. THEME: Demon Slayer Tanjiro Kamado and Nezuko Kamado, recognizable elegant chibi anime portraits. Tanjiro burgundy hair scar and green black checkered haori, Nezuko long black hair pink eyes pink kimono bamboo mouthpiece. Their two complete faces beside each other in the bottom footer band, flowing blue water curls along narrow sides, pink sakura flowers, emerald checkers and gold Japanese cloud accents in header. IMPORTANT GEOMETRY: keep all character heads and main decorations entirely inside TOP 8% and BOTTOM 12% header/footer bands. Side rails only 7% of image width each, slender decorative motifs there. Entire central rectangle from x8% to92% and y9% to87% must be empty real alpha transparency. NO interior divisions, NO photographs, NO checkerboard, NO grid background, NO letters, NO text, NO watermark. This is one finished illustrated rectangular outer frame with large transparent center. Whole outer frame visible with padding. Corners ornate but never obstruct center. Genuine alpha background.

### `frame-zenitsu.png`

Create a single beautiful production photobooth OUTER FRAME, portrait 1024:1820 aspect. Original polished 2D cel shaded anime collectible stationery artwork, detailed crisp ink outlines, luminous color, carefully designed balanced border. THEME: Demon Slayer Zenitsu Agatsuma, recognizable chibi anime boy with golden orange hair and yellow haori with tiny white triangles, joyful determined eyes, miniature sword held safely across torso. Complete character head and shoulders in bottom footer band, golden lightning tracing narrow side margins, warm orange chrysanthemums, tiny sparrow in top header, rich black yellow gold palette. IMPORTANT GEOMETRY: keep all character heads and main decorations entirely inside TOP 8% and BOTTOM 12% header/footer bands. Side rails only 7% of image width each, slender decorative motifs there. Entire central rectangle from x8% to92% and y9% to87% must be empty real alpha transparency. NO interior divisions, NO photographs, NO checkerboard, NO grid background, NO letters, NO text, NO watermark. This is one finished illustrated rectangular outer frame with large transparent center. Whole outer frame visible with padding. Corners ornate but never obstruct center. Genuine alpha background.

### `frame-inosuke.png`

Create a single beautiful production photobooth OUTER FRAME, portrait 1024:1820 aspect. Original polished 2D cel shaded anime collectible stationery artwork, detailed crisp ink outlines, luminous color, carefully designed balanced border. THEME: Demon Slayer Inosuke Hashibira, recognizable chibi anime character wearing his gray boar head mask with bright blue eyes pink snout and fur, muscular little shoulders. Complete boar head and shoulders in bottom footer band, two decorative crossed chipped swords in top header, indigo navy borders, soft ivory Japanese smoke clouds and green leaves tracing narrow sides, electric blue accents. IMPORTANT GEOMETRY: keep all character heads and main decorations entirely inside TOP 8% and BOTTOM 12% header/footer bands. Side rails only 7% of image width each, slender decorative motifs there. Entire central rectangle from x8% to92% and y9% to87% must be empty real alpha transparency. NO interior divisions, NO photographs, NO checkerboard, NO grid background, NO letters, NO text, NO watermark. This is one finished illustrated rectangular outer frame with large transparent center. Whole outer frame visible with padding. Corners ornate but never obstruct center. Genuine alpha background.
