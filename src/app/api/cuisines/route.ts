import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ cuisines: [] });

    const { data } = await supabase
      .from('items')
      .select('cuisine')
      .eq('type', 'food')
      .not('cuisine', 'is', null)
      .neq('cuisine', '')
      .order('cuisine');

    const unique = [...new Set((data || []).map((r: { cuisine: string }) => r.cuisine))].filter(Boolean).sort();
    return NextResponse.json({ cuisines: unique });
  } catch {
    return NextResponse.json({ cuisines: [] });
  }
}
