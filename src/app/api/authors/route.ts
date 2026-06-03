import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ authors: [] });

    const { data } = await supabase
      .from('items')
      .select('creator')
      .eq('type', 'book')
      .not('creator', 'is', null)
      .neq('creator', '')
      .order('creator');

    const unique = [...new Set((data || []).map((r: { creator: string }) => r.creator))].filter(Boolean).sort();
    return NextResponse.json({ authors: unique });
  } catch {
    return NextResponse.json({ authors: [] });
  }
}
