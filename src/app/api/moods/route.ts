import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ moods: [] });

    const { data } = await supabase
      .from('items')
      .select('mood')
      .eq('type', 'movie')
      .not('mood', 'is', null)
      .neq('mood', '')
      .order('mood');

    const unique = [...new Set((data || []).map((r: { mood: string }) => r.mood))].filter(Boolean).sort();
    return NextResponse.json({ moods: unique });
  } catch {
    return NextResponse.json({ moods: [] });
  }
}
