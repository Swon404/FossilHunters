#!/usr/bin/env node
/**
 * FossilHunters – fetch-images.mts
 *
 * Downloads Creative Commons / Public Domain specimen images from Wikimedia Commons.
 * Run: npx tsx scripts/fetch-images.mts
 *
 * Output:
 *   public/specimens/<id>.jpg   (max 600px wide)
 *   public/specimens/credits.json
 *
 * Only these licences are downloaded:
 *   CC0, CC-BY, CC-BY-SA, Public Domain
 */

import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { writeFile }  from 'node:fs/promises';
import { join }       from 'node:path';
import { Readable }   from 'node:stream';
import { pipeline }   from 'node:stream/promises';

// ── Inline specimen list (avoid tsx import complexity) ───────────
// This mirrors specimens.ts wikimediaTitle fields.
const SPECIMENS: { id: string; wikimediaTitle: string }[] = [
  { id: 'eoraptor',           wikimediaTitle: 'Eoraptor lunensis.jpg' },
  { id: 'coelophysis',        wikimediaTitle: 'Coelophysis bauri.jpg' },
  { id: 'plateosaurus',       wikimediaTitle: 'Plateosaurus engelhardti mojo.jpg' },
  { id: 'brachiosaurus',      wikimediaTitle: 'Brachiosaurus DB.jpg' },
  { id: 'stegosaurus',        wikimediaTitle: 'Stegosaurus stenops sophie.jpg' },
  { id: 'allosaurus',         wikimediaTitle: 'Allosaurus Revised.jpg' },
  { id: 'diplodocus',         wikimediaTitle: 'Diplodocus carnegii hatcher.png' },
  { id: 'archaeopteryx',      wikimediaTitle: 'Archaeopteryx lithographica (Berlin specimen).jpg' },
  { id: 'ichthyosaurus',      wikimediaTitle: 'Ichthyosaurus BW.jpg' },
  { id: 'pterodactyl',        wikimediaTitle: 'Pterodactylus antiquus old.jpg' },
  { id: 'trex',               wikimediaTitle: 'Tyrannosaurus rex mmartyniuk wiki.png' },
  { id: 'triceratops',        wikimediaTitle: 'Triceratops liveDB.jpg' },
  { id: 'velociraptor',       wikimediaTitle: 'Velociraptor dinoguy2.jpg' },
  { id: 'spinosaurus',        wikimediaTitle: 'Spinosaurus BW (flipped).jpg' },
  { id: 'ankylosaurus',       wikimediaTitle: 'Ankylosaurus magniventris.png' },
  { id: 'parasaurolophus',    wikimediaTitle: 'Parasaurolophus DB.jpg' },
  { id: 'pteranodon',         wikimediaTitle: 'Pteranodon hires.jpg' },
  { id: 'mosasaurus',         wikimediaTitle: 'Mosasaurus hoffmannii.jpg' },
  { id: 'pachycephalosaurus', wikimediaTitle: 'Pachycephalosaurus BW.jpg' },
  { id: 'baryonyx',           wikimediaTitle: 'Baryonyx walkeri DB.jpg' },
  { id: 'iguanodon',          wikimediaTitle: 'Iguanodon DB.jpg' },
  { id: 'woolly-mammoth',     wikimediaTitle: 'Woolly mammoth.jpg' },
  { id: 'sabre-tooth',        wikimediaTitle: 'Smilodon californicus.jpg' },
  { id: 'cave-bear',          wikimediaTitle: 'Ursus spelaeus Sergiodlarosa.jpg' },
  { id: 'neanderthal',        wikimediaTitle: 'Neanderthal 2D.jpg' },
  { id: 'woolly-rhino',       wikimediaTitle: 'Coelodonta antiquitatis.jpg' },
  { id: 'hand-axe',           wikimediaTitle: 'Bifaz de la Cuesta de la Bajada.jpg' },
  { id: 'cave-painting',      wikimediaTitle: 'Lascaux painting.jpg' },
  { id: 'flint-blade',        wikimediaTitle: 'Flint arrowheads.jpg' },
  { id: 'microlith',          wikimediaTitle: 'Microliths.jpg' },
  { id: 'stonehenge',         wikimediaTitle: 'Stonehenge2007_07_30.jpg' },
  { id: 'polished-stone-axe', wikimediaTitle: 'Polished stone axe.jpg' },
  { id: 'pottery',            wikimediaTitle: 'Neolithic ceramique.jpg' },
  { id: 'bronze-sword',       wikimediaTitle: 'BronzeSword.jpg' },
  { id: 'celtic-torc',        wikimediaTitle: 'Torc aureus.jpg' },
];

const ALLOWED_LICENCES = [
  'cc0', 'public domain', 'cc-by', 'cc-by-sa',
  'attribution', 'creativecommons.org/licenses/by/',
  'creativecommons.org/licenses/by-sa/',
  'creativecommons.org/publicdomain/',
];

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const OUT_DIR       = join(process.cwd(), 'public', 'specimens');

interface ImageInfo {
  url: string;
  descriptionurl: string;
  extmetadata?: {
    LicenseShortName?: { value: string };
    Artist?: { value: string };
    LicenseUrl?: { value: string };
  };
}

interface Credit {
  id: string;
  title: string;
  artist: string;
  license: string;
  sourceUrl: string;
}

function isAllowedLicence(info: ImageInfo): boolean {
  const meta = info.extmetadata;
  if (!meta) return false;
  const short  = (meta.LicenseShortName?.value ?? '').toLowerCase();
  const urlLic = (meta.LicenseUrl?.value ?? '').toLowerCase();
  return ALLOWED_LICENCES.some(l => short.includes(l) || urlLic.includes(l));
}

async function fetchImageInfo(title: string): Promise<ImageInfo | null> {
  const url = new URL(WIKIMEDIA_API);
  url.searchParams.set('action', 'query');
  url.searchParams.set('titles', `File:${title}`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata');
  url.searchParams.set('iiurlwidth', '600');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res  = await fetch(url.toString());
  const json = await res.json() as { query: { pages: Record<string, { imageinfo?: ImageInfo[] }> } };
  const page = Object.values(json.query.pages)[0];
  return page?.imageinfo?.[0] ?? null;
}

async function downloadImage(imageUrl: string, dest: string): Promise<void> {
  const res = await fetch(imageUrl);
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const stream = createWriteStream(dest);
  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), stream);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const credits: Credit[] = [];
  let downloaded = 0;
  let skipped    = 0;
  let failed     = 0;

  for (const { id, wikimediaTitle } of SPECIMENS) {
    const dest = join(OUT_DIR, `${id}.jpg`);
    if (existsSync(dest)) {
      console.log(`  ⏭  ${id} — already exists, skipping`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ⬇  ${id} (${wikimediaTitle}) … `);

    try {
      const info = await fetchImageInfo(wikimediaTitle);
      if (!info) { console.log('no info'); failed++; continue; }
      if (!isAllowedLicence(info)) {
        console.log(`SKIPPED (licence: ${info.extmetadata?.LicenseShortName?.value ?? 'unknown'})`);
        skipped++;
        continue;
      }

      const thumbUrl = (info as ImageInfo & { thumburl?: string }).thumburl ?? info.url;
      await downloadImage(thumbUrl, dest);

      const artist  = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '') ?? 'Unknown';
      const license = info.extmetadata?.LicenseShortName?.value ?? 'Unknown';
      credits.push({ id, title: wikimediaTitle, artist, license, sourceUrl: info.descriptionurl });
      console.log(`OK (${license})`);
      downloaded++;

      // Be polite to Wikimedia servers
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`ERROR: ${(err as Error).message}`);
      failed++;
    }
  }

  await writeFile(join(OUT_DIR, 'credits.json'), JSON.stringify(credits, null, 2));

  console.log('\n── Summary ────────────────────────────────');
  console.log(`  Downloaded : ${downloaded}`);
  console.log(`  Skipped    : ${skipped}`);
  console.log(`  Failed     : ${failed}`);
  console.log(`  Credits    : public/specimens/credits.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
