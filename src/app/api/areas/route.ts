import { NextResponse } from 'next/server';
import { cachedJson } from '@/lib/cache';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return cachedJson({ areas: [] });

    const { data } = await supabase
      .from('items')
      .select('area')
      .eq('type', 'food')
      .not('area', 'is', null)
      .neq('area', '')
      .order('area');

    const unique = [...new Set((data || []).map((r: { area: string }) => r.area))].filter(Boolean).sort();
    return cachedJson({ areas: unique });
  } catch {
    return cachedJson({ areas: [] });
  }
}
