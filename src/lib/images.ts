/**
 * Returns a smaller image URL for card thumbnails.
 * OpenLibrary: convert -L.jpg (large, ~500px) to -S.jpg (small, ~75px for fast loading)
 * Google Books: reduce zoom to 0 for smallest thumbnail
 */
export function thumbnailUrl(url: string | null): string | null {
  if (!url) return null;
  // OpenLibrary: -L.jpg → -S.jpg (smallest, fastest loading)
  if (url.includes('covers.openlibrary.org')) {
    return url.replace(/-L\.jpg$/, '-S.jpg').replace(/-M\.jpg$/, '-S.jpg');
  }
  // Google Books: use zoom=0 for thumbnails, strip edge=curl for faster load
  if (url.includes('books.google.com')) {
    return url.replace(/zoom=\d+/, 'zoom=0').replace(/&edge=curl/, '');
  }
  return url;
}
