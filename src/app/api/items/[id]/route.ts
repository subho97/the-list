import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Get reviews for food items
  let reviews = [];
  if (item.type === 'food') {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('item_id', id)
      .order('created_at', { ascending: false });
    reviews = reviewsData || [];
  }

  return NextResponse.json({ ...item, reviews });
}
