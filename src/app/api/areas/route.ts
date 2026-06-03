import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ areas: [] });

    const { data } = await supabase
      .from('items')
      .select('area')
      .eq('type', 'food')
      .not('area', 'is', null)
      .neq('area', '')
      .order('area');

    const unique = [...new Set((data || []).map((r: { area: string }) => r.area))].filter(Boolean).sort();
    return NextResponse.json({ areas: unique });
  } catch {
    return NextResponse.json({ areas: [] });
  }
}
