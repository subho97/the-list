import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Get list
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // Get items in the list
  const { data: listItems, error: itemsError } = await supabase
    .from('list_items')
    .select(`
      id,
      added_at,
      note,
      items (*)
    `)
    .eq('list_id', list.id)
    .order('added_at', { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...list,
    items: listItems?.map((li: { items: unknown; id: string; added_at: string; note: string | null }) => ({
      ...(li.items as object),
      list_item_id: li.id,
      added_at: li.added_at,
      note: li.note,
    })) || [],
  });
}
