/**
 * Returns a smaller image URL for card thumbnails.
 * OpenLibrary: convert -L.jpg (large, ~500px) to -S.jpg (small, ~75px for fast loading)
 * Google Books: reduce zoom to 0 for smallest thumbnail
 */
export function thumbnailUrl(url: string | null): string | null {
  if (!url) return null;
  // OpenLibrary: -L.jpg (large ~500px) → -M.jpg (medium ~180px, good quality + fast)
  if (url.includes('covers.openlibrary.org')) {
    return url.replace(/-L\.jpg$/, '-M.jpg').replace(/-S\.jpg$/, '-M.jpg');
  }
  // Google Books: strip edge=curl + use smaller thumbnail zoom (3 = ~130px, loads fast)
  if (url.includes('books.google.com')) {
    return url
      .replace(/&edge=curl/, '')
      .replace(/zoom=\d+/, 'zoom=4');
  }
  return url;
}
