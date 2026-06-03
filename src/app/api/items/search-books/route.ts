import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use Open Library Search API — free, no API key required
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20&fields=key,title,author_name,first_publish_year,isbn,cover_i,id_goodreads,id_librarything,edition_count`
    );
    const data = await res.json();

    const results = (data.docs || []).map((doc: any) => ({
      id: doc.key || `/${doc.isbn?.[0] || doc.cover_i || 'unknown'}`,
      volumeInfo: {
        title: doc.title || 'Unknown',
        authors: doc.author_name || [],
        publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
        description: null,
        imageLinks: doc.cover_i
          ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` }
          : null,
        averageRating: null,
        infoLink: doc.key ? `https://openlibrary.org${doc.key}` : null,
        categories: [],
      },
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}
