const express = require('express');
const router = express.Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
const PER_PAGE = 18;

const FORBIDDEN_KEYWORDS = [
  'nude', 'nudes', 'naked', 'bikini', 'bikinis', 'swimsuit', 'swimwear', 'lingerie', 
  'underwear', 'topless', 'erotic', 'nsfw', 'adult', 'cleavage', 'sexy', 
  'babe', 'sensual', 'playboy', 'boobs', 'butt', 'breast', 'bust', 'thong', 
  'panties', 'bra', 'strip', 'porn', 'xxx', 'sex', 'erotica', 'nude art', 'nude photography',
  'ted van pelt', 'water ski', 'water skiing', 'vintage swimsuit', 'retro swimsuit', 'old swimsuit photo',
  'sam droege', 'droege', 'insect', 'insects', 'grasshopper', 'locust', 'gryllidae', 'cicada', 'macro insect', 'bug', 'bugs', 'cockroach', 'beetle'
];

function containsInappropriateContent(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return FORBIDDEN_KEYWORDS.some(kw => {
    const reg = new RegExp(`\\b${kw}\\b`, 'i');
    return reg.test(lower) || lower.includes(kw);
  });
}

function filterSafePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.filter(p => {
    const textToCheck = `${p.id || ''} ${p.photographer || ''} ${p.photographer_url || ''} ${p.url || ''} ${p.alt || ''} ${p.tags || ''} ${p.title || ''}`;
    return !containsInappropriateContent(textToCheck);
  });
}

// Fetch from Openverse with a given query
async function fetchFromOpenverse(query, page) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page=${page}&page_size=${PER_PAGE}&license_type=commercial,modification`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Gubbi/1.0 (educational app)' } });
  if (!r.ok) return null;
  const d = await r.json();
  if (!d.results || d.results.length === 0) return null;
  const photos = d.results.map((item, i) => ({
    id:               `ov-${item.id || i}-${page}`,
    photographer:     item.creator || 'Openverse',
    photographer_url: item.creator_url || item.foreign_landing_url || 'https://openverse.org',
    url:              item.foreign_landing_url || item.url,
    width:            item.width  || 1920,
    height:           item.height || 1280,
    alt:              item.title || '',
    src: {
      medium:   item.thumbnail || item.url,
      large2x:  item.url,
      original: item.url
    }
  }));

  const safePhotos = filterSafePhotos(photos);

  return {
    photos: safePhotos,
    hasMore:       page < Math.ceil((d.result_count || PER_PAGE) / PER_PAGE),
    total_results: d.result_count || d.results.length,
    source:        'openverse'
  };
}

router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  const page  = parseInt(req.query.page) || 1;
  const clientKey = req.headers['x-pexels-key'] || PEXELS_API_KEY;

  if (containsInappropriateContent(query)) {
    return res.status(200).json({
      photos: [],
      hasMore: false,
      total_results: 0,
      notice: 'Query blocked by content safety filter'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 1. PEXELS (primary — best quality, needs API key)
  // ─────────────────────────────────────────────────────────────
  if (clientKey) {
    try {
      const url = query
        ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}`
        : `https://api.pexels.com/v1/curated?page=${page}&per_page=${PER_PAGE}`;

      const r = await fetch(url, { headers: { Authorization: clientKey } });
      if (r.status === 200) {
        const d = await r.json();
        if (d.photos && d.photos.length > 0) {
          const mapped = d.photos.map(p => ({
            id:               String(p.id),
            photographer:     p.photographer,
            photographer_url: p.photographer_url,
            url:              p.url,
            alt:              p.alt || p.url || '',
            width:            p.width,
            height:           p.height,
            src: { medium: p.src.medium, large2x: p.src.large2x, original: p.src.original }
          }));

          const safePhotos = filterSafePhotos(mapped);

          return res.json({
            photos: safePhotos,
            hasMore:       !!d.next_page,
            total_results: d.total_results || 0,
            source:        'pexels'
          });
        }
      }
    } catch (e) {
      console.warn('Pexels error:', e.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. OPENVERSE (free, no key, Creative Commons, keyword-accurate)
  // ─────────────────────────────────────────────────────────────
  const safeQ = query || 'nature landscape';

  try {
    const result = await fetchFromOpenverse(safeQ, page);
    if (result && result.photos.length >= 6) {
      return res.json(result);
    }

    // If few results, try with just the first word of the query
    if (safeQ.includes(' ')) {
      const firstWord = safeQ.split(' ')[0];
      if (!containsInappropriateContent(firstWord)) {
        const result2 = await fetchFromOpenverse(firstWord, page);
        if (result2 && result2.photos.length > 0) {
          // Merge if we had some from the full query
          const combined = result ? [...result.photos, ...result2.photos] : result2.photos;
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, PER_PAGE);
          return res.json({
            photos: filterSafePhotos(unique),
            hasMore: result2.hasMore,
            total_results: result2.total_results,
            source: 'openverse-combined'
          });
        }
      }
    }

    // Return whatever we had, even if few
    if (result) return res.json(result);
  } catch (e) {
    console.warn('Openverse error:', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Last resort — nature images (never show empty)
  // ─────────────────────────────────────────────────────────────
  try {
    const fallback = await fetchFromOpenverse('nature landscape beautiful', page);
    if (fallback) return res.json({ ...fallback, source: 'openverse-fallback' });
  } catch (e) {
    console.warn('Fallback failed:', e.message);
  }

  return res.status(200).json({ photos: [], hasMore: false, total_results: 0, error: 'No images found' });
});

module.exports = router;

