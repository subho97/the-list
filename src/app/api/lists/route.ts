import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ lists: [] });
  }

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Strip edit_pin from list data in GET all
  const lists = (data || []).map(({ edit_pin, ...rest }) => ({
    ...rest,
    has_pin: !!edit_pin,
  }));

  return NextResponse.json({ lists });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();

  const { name, description, created_by, edit_pin } = body;

  if (!name) {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 });
  }

  // Validate PIN if provided
  if (edit_pin !== undefined && edit_pin !== null) {
    const pinStr = String(edit_pin);
    if (!/^[a-zA-Z0-9]{4,6}$/.test(pinStr)) {
      return NextResponse.json({ error: 'PIN must be 4-6 alphanumeric characters' }, { status: 400 });
    }
  }

  let slug = slugify(name);

  // Check if slug exists, append number if it does
  const { data: existing } = await supabase
    .from('lists')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    const timestamp = Date.now().toString(36);
    slug = `${slug}-${timestamp}`;
  }

  const insertData: Record<string, unknown> = {
    name,
    slug,
    description: description || null,
    created_by: created_by || 'Anonymous',
  };

  if (edit_pin !== undefined && edit_pin !== null && String(edit_pin).trim() !== '') {
    insertData.edit_pin = hashPin(String(edit_pin).trim());
  }

  const { data, error } = await supabase
    .from('lists')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, has_pin: !!data.edit_pin }, { status: 201 });
}
