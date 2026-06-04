import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function POST(
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

  // Get the list to verify PIN
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
    const pinStr = String(pin || '');
    if (!pin || !/^[a-zA-Z0-9]{4,6}$/.test(pinStr)) {
      return NextResponse.json({ error: 'Valid PIN is required' }, { status: 403 });
    }
    const hashed = hashPin(pinStr);
    if (hashed !== list.edit_pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
    }
  }

  // Get the list_item
  const { data: listItem, error: findError } = await supabase
    .from('list_items')
    .select('id, checked')
    .eq('id', itemId)
    .eq('list_id', list.id)
    .single();

  if (findError || !listItem) {
    return NextResponse.json({ error: 'Item not found in this list' }, { status: 404 });
  }

  // Toggle checked state
  const newChecked = !listItem.checked;
  const updateData: { checked: boolean; checked_at?: string | null } = { checked: newChecked, checked_at: null };
  if (newChecked) {
    updateData.checked_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('list_items')
    .update(updateData)
    .eq('id', itemId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ checked: newChecked, checked_at: updateData.checked_at || null });
}
