import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  const { slug, itemId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { pin } = body;

  // Get the list to verify PIN and check slug
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id, edit_pin')
    .eq('slug', slug)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // Verify PIN if list has one
  if (list.edit_pin) {
    if (!pin || !/^\d{4}$/.test(String(pin))) {
      return NextResponse.json({ error: 'Valid 4-digit PIN is required to edit this list' }, { status: 403 });
    }
    const hashed = hashPin(String(pin));
    if (hashed !== list.edit_pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
    }
  }

  // Delete the list item — verify it belongs to this list
  const { data: listItem, error: findError } = await supabase
    .from('list_items')
    .select('id')
    .eq('id', itemId)
    .eq('list_id', list.id)
    .single();

  if (findError || !listItem) {
    return NextResponse.json({ error: 'Item not found in this list' }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from('list_items')
    .delete()
    .eq('id', itemId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
