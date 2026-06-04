import { NextResponse } from 'next/server';
import { cachedJson } from '@/lib/cache';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return cachedJson({ genres: [] });

    const { data } = await supabase
      .from('items')
      .select('genre')
      .in('type', ['movie', 'book'])
      .not('genre', 'is', null)
      .neq('genre', '')
      .order('genre');

    const unique = [...new Set((data || []).map((r: { genre: string }) => r.genre))].filter(Boolean).sort();
    return cachedJson({ genres: unique });
  } catch {
    return cachedJson({ genres: [] });
  }
}
