import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { pin } = body;

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    // Get the list
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id, edit_pin, name')
      .eq('slug', slug)
      .single();

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Verify PIN if list has one
    if (list.edit_pin) {
      if (!pin) {
        return NextResponse.json({ error: 'PIN is required to delete this list' }, { status: 403 });
      }
      const hashedInput = hashPin(String(pin));
      if (hashedInput !== list.edit_pin) {
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
      }
    } else {
      // List has no PIN — allow deletion without PIN
      // (anyone can edit an open list anyway)
    }

    // Delete the list (cascade will handle list_items)
    const { error: deleteError } = await supabase
      .from('lists')
      .delete()
      .eq('id', list.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, deleted: list.name });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Delete failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
