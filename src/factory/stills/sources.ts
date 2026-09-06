/**
 * Official stock APIs only. Do not scrape Google Images or copyrighted stills.
 * Wikimedia needs no key. Unsplash/Pexels/Pixabay read env keys when present.
 */

export type StockHit = {
  url: string;
  thumb?: string;
  license: string;
  author?: string;
  source: 'wikimedia' | 'unsplash' | 'pexels' | 'pixabay';
  query: string;
};

export const stockSearchPlan = (query: string) => ({
  query,
  order: ['wikimedia', 'unsplash', 'pexels', 'pixabay'] as const,
  note: 'Download from the official page/API. Record license. Then PIL cover-crop to 1080×1920. Never scrape copyrighted stills. No unauthorized logos.',
});

export const wikimediaSearchUrl = (query: string): string => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    origin: '*',
  });
  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
};
