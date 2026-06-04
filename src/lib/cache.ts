import { NextResponse } from 'next/server';

/**
 * Creates a cached JSON response with Vercel CDN edge caching.
 * s-maxage: how long CDN caches (seconds)
 * stale-while-revalidate: serve stale while revalidating (seconds)
 */
export function cachedJson(data: unknown, options?: {
  status?: number;
  /** CDN cache duration in seconds */
  ttl?: number;
  /** Browser cache duration in seconds */
  browserTTL?: number;
}) {
  const ttl = options?.ttl ?? 60;       // 1 min CDN cache default
  const browserTTL = options?.browserTTL ?? 10; // 10s browser cache default

  return NextResponse.json(data, {
    status: options?.status ?? 200,
    headers: {
      'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 10}, max-age=${browserTTL}`,
    },
  });
}
