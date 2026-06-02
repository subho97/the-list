import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Item } from '@/lib/types';
import ListPageClient from './ListPageClient';

interface ListData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  created_by: string;
  has_pin: boolean;
  items: (Item & { list_item_id: string; added_at: string; note: string | null })[];
}

async function getList(slug: string): Promise<ListData | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: list } = await supabase
      .from('lists')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!list) return null;

    const { edit_pin } = list;

    const { data: listItems } = await supabase
      .from('list_items')
      .select(`
      id,
      added_at,
      note,
      items (*)
    `)
      .eq('list_id', list.id)
      .order('added_at', { ascending: true });

    const { edit_pin: _, ...listWithoutPin } = list;

    return {
      ...listWithoutPin,
      has_pin: !!edit_pin,
      items: (listItems || []).map((li: { items: unknown; id: string; added_at: string; note: string | null }) => ({
        ...(li.items as object),
        list_item_id: li.id,
        added_at: li.added_at,
        note: li.note,
      } as Item & { list_item_id: string; added_at: string; note: string | null })),
    };
  } catch {
    return null;
  }
}

export default async function ListDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getList(slug);

  if (!list) {
    notFound();
  }

  return <ListPageClient list={list} />;
}

export const dynamic = 'force-dynamic';
