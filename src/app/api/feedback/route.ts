import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const body = await request.json();
    const { item_id, item_title, feedback_type, message, contact, page_url } = body;

    if (!message || !feedback_type) {
      return NextResponse.json({ error: 'Message and type required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        item_id: item_id || null,
        item_title: item_title || null,
        feedback_type,
        message,
        contact: contact || '',
        page_url: page_url || '',
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to submit feedback';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ feedback: [] });

    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ feedback: data || [] });
  } catch {
    return NextResponse.json({ feedback: [] });
  }
}
