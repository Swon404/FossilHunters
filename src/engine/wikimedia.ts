/** Resolves a Wikimedia Commons file title to a thumbnail URL via the public API.
 *  Results are cached in memory so each title is only fetched once per session. */

const cache = new Map<string, string | null>();

export async function resolveWikimediaUrl(title: string, widthPx = 400): Promise<string | null> {
  if (cache.has(title)) return cache.get(title)!;

  const encoded = encodeURIComponent(`File:${title}`);
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&titles=${encoded}&prop=imageinfo` +
    `&iiprop=url&iiurlwidth=${widthPx}&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) { cache.set(title, null); return null; }
    const json = await res.json();
    const pages: Record<string, { imageinfo?: Array<{ thumburl?: string }> }> =
      json?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const thumbUrl = page?.imageinfo?.[0]?.thumburl ?? null;
    cache.set(title, thumbUrl);
    return thumbUrl;
  } catch {
    cache.set(title, null);
    return null;
  }
}
