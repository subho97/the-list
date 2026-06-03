/**
 * Returns a smaller image URL for card thumbnails.
 * OpenLibrary: convert -L.jpg (large) to -M.jpg (medium, ~180px)
 * Google Books: already small thumbnails via zoom=1
 */
export function thumbnailUrl(url: string | null): string | null {
  if (!url) return null;
  // OpenLibrary: -L.jpg → -M.jpg
  if (url.includes('covers.openlibrary.org') && url.endsWith('-L.jpg')) {
    return url.replace('-L.jpg', '-M.jpg');
  }
  // Google Books: already small
  return url;
}
