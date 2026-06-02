import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();

  const { item_id, note, pin } = body;

  if (!item_id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  // Get list by slug — include edit_pin to check PIN
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
    if (!pin) {
      return NextResponse.json({ error: 'Valid 4-digit PIN is required to edit this list' }, { status: 403 });
    }
    // Accept both 4-digit and 6-alphanumeric PINs for backward compatibility
    const pinStr = String(pin);
    if (!/^[a-zA-Z0-9]{4,6}$/.test(pinStr)) {
      return NextResponse.json({ error: 'PIN must be 4-6 alphanumeric characters' }, { status: 403 });
    }
    const hashed = hashPin(String(pin));
    if (hashed !== list.edit_pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
    }
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
