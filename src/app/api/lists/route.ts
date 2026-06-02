import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
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

  return NextResponse.json({ lists: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();

  const { name, description, created_by } = body;

  if (!name) {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 });
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

  const { data, error } = await supabase
    .from('lists')
    .insert({
      name,
      slug,
      description: description || null,
      created_by: created_by || 'Anonymous',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
