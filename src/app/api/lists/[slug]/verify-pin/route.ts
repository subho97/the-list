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
  const { pin } = body;

  if (!pin || !/^\d{4}$/.test(String(pin))) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  // Get the list to check PIN
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('edit_pin')
    .eq('slug', slug)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  if (!list.edit_pin) {
    // List has no PIN — anyone can edit
    return NextResponse.json({ verified: true });
  }

  const hashed = hashPin(String(pin));
  const verified = hashed === list.edit_pin;

  if (!verified) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  return NextResponse.json({ verified: true });
}
