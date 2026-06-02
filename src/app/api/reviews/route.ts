import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Handle multipart form data
  const formData = await request.formData();
  const item_id = formData.get('item_id') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string || null;
  const reviewed_by = formData.get('reviewed_by') as string || 'Anonymous';
  const photo = formData.get('photo') as File | null;

  if (!item_id || !rating || !photo) {
    return NextResponse.json({ error: 'Item ID, rating, and photo are required' }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  // Verify item exists and is food
  const { data: item } = await supabase
    .from('items')
    .select('id, type')
    .eq('id', item_id)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Upload photo to Supabase Storage
  const fileExt = photo.name.split('.').pop() || 'jpg';
  const fileName = `reviews/${item_id}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('review-photos')
    .upload(fileName, photo, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from('review-photos')
    .getPublicUrl(fileName);

  // Create review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      item_id,
      rating,
      comment,
      photo_url: publicUrlData.publicUrl,
      reviewed_by,
    })
    .select()
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  return NextResponse.json(review, { status: 201 });
}
