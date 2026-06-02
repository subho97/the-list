import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ cities: [] });

    const { data } = await supabase
      .from('items')
      .select('city')
      .not('city', 'is', null)
      .neq('city', '')
      .order('city');

    const uniqueCities = [...new Set((data || []).map((r: { city: string }) => r.city))].filter(Boolean);
    return NextResponse.json({ cities: uniqueCities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
