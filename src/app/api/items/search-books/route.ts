import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
  if (!GOOGLE_BOOKS_API_KEY) {
    return NextResponse.json({ error: 'Google Books API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=20`
    );
    const data = await res.json();

    return NextResponse.json({ results: data.items || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}
