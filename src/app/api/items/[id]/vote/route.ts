import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { vote } = body; // 'up' or 'down'

    if (!vote || !['up', 'down'].includes(vote)) {
      return NextResponse.json({ error: 'Vote must be "up" or "down"' }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const column = vote === 'up' ? 'upvotes' : 'downvotes';
    const { data, error } = await supabase
      .rpc('increment_vote', { row_id: id, col: column });

    if (error) {
      // RPC might not exist, use direct update
      const { data: item } = await supabase
        .from('items')
        .select(column)
        .eq('id', id)
        .single();

      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

      const current = item[column as keyof typeof item] as number || 0;
      const { error: updateError } = await supabase
        .from('items')
        .update({ [column]: current + 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // Get updated counts — already incremented by the update above
    const { data: updated } = await supabase
      .from('items')
      .select('upvotes, downvotes')
      .eq('id', id)
      .single();

    return NextResponse.json({
      upvotes: updated?.upvotes || 0,
      downvotes: updated?.downvotes || 0,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Vote failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
