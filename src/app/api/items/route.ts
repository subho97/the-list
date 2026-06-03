import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const city = searchParams.get('city');
  const genre = searchParams.get('genre');
  const mood = searchParams.get('mood');
  const cuisine = searchParams.get('cuisine');
  const minRating = parseFloat(searchParams.get('minRating') || '');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ items: [], total: 0, page: 1, limit, hasMore: false });
  }

  let query = supabase
    .from('items')
    .select('*', { count: 'exact' });

  if (type && ['movie', 'book', 'food'].includes(type)) {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (city) {
    query = query.eq('city', city);
  }

  if (genre) {
    query = query.ilike('genre', `%${genre}%`);
  }

  if (mood) {
    query = query.eq('mood', mood);
  }

  if (cuisine) {
    query = query.ilike('cuisine', `%${cuisine}%`);
  }

  if (!isNaN(minRating)) {
    query = query.gte('external_rating', minRating);
  }

  const { data, error, count } = await query
    .order('title', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (offset + limit) < (count || 0),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();

  const { type, title, creator, year, description, image_url, external_rating, imdb_id, external_link, added_by, city, google_maps_link, genre, mood, cuisine, must_try, notes, purchase_link, lat, lng } = body;

  if (!type || !title) {
    return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
  }

  if (!['movie', 'book', 'food'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type. Must be movie, book, or food' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      type,
      title,
      creator: creator || null,
      year: year || null,
      description: description || null,
      image_url: image_url || null,
      external_rating: external_rating || null,
      imdb_id: imdb_id || null,
      external_link: external_link || null,
      added_by: added_by || 'Anonymous',
      city: city || null,
      google_maps_link: google_maps_link || null,
      genre: genre || null,
      mood: mood || null,
      cuisine: cuisine || null,
      must_try: must_try || null,
      notes: notes || null,
      purchase_link: purchase_link || null,
      lat: lat || null,
      lng: lng || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
