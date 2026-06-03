import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ genres: [] });

    const { data } = await supabase
      .from('items')
      .select('genre')
      .in('type', ['movie', 'book'])
      .not('genre', 'is', null)
      .neq('genre', '')
      .order('genre');

    const unique = [...new Set((data || []).map((r: { genre: string }) => r.genre))].filter(Boolean).sort();
    return NextResponse.json({ genres: unique });
  } catch {
    return NextResponse.json({ genres: [] });
  }
}
