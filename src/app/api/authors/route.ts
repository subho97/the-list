import { NextResponse } from 'next/server';
import { cachedJson } from '@/lib/cache';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return cachedJson({ authors: [] });

    const { data } = await supabase
      .from('items')
      .select('creator')
      .eq('type', 'book')
      .not('creator', 'is', null)
      .neq('creator', '')
      .order('creator');

    const unique = [...new Set((data || []).map((r: { creator: string }) => r.creator))].filter(Boolean).sort();
    return cachedJson({ authors: unique });
  } catch {
    return cachedJson({ authors: [] });
  }
}
