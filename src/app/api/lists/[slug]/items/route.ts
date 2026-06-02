import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { item_id, note } = body;

  if (!item_id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  // Get list by slug
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('slug', slug)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // Verify item exists
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('id')
    .eq('id', item_id)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Add item to list
  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: list.id,
      item_id,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Item already in this list' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
