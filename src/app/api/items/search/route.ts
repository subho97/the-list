import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const OMDB_API_KEY = process.env.OMDB_API_KEY;
  if (!OMDB_API_KEY) {
    return NextResponse.json({ error: 'OMDB API key not configured' }, { status: 500 });
  }

  try {
    // Search OMDb
    const searchRes = await fetch(
      `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q)}&type=movie`
    );
    const searchData = await searchRes.json();

    if (searchData.Error) {
      return NextResponse.json({ results: [] });
    }

    // Get detailed info for each result including IMDB ratings
    const detailedResults = await Promise.all(
      (searchData.Search || []).slice(0, 10).map(async (item: { imdbID: string }) => {
        const detailRes = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${item.imdbID}&plot=short`
        );
        return detailRes.json();
      })
    );

    return NextResponse.json({ results: detailedResults });
  } catch {
    return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
  }
}
