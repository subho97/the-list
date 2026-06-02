import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Item } from '@/lib/types';
import { Calendar, Share2, User, Clock } from 'lucide-react';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import ListActions from './ListActions';

interface ListData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  created_by: string;
  items: (Item & { list_item_id: string; added_at: string; note: string | null })[];
}

async function getList(slug: string): Promise<ListData | null> {
  const supabase = await createClient();

  const { data: list } = await supabase
    .from('lists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!list) return null;

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

  return {
    ...list,
    items: (listItems || []).map((li: { items: unknown; id: string; added_at: string; note: string | null }) => ({
      ...(li.items as object),
      list_item_id: li.id,
      added_at: li.added_at,
      note: li.note,
    } as Item & { list_item_id: string; added_at: string; note: string | null })),
  };
}

export default async function ListDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getList(slug);

  if (!list) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1 text-sm text-olive hover:text-stone-600 mb-3 transition-colors"
        >
          ← All Lists
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
                {list.name}
              </h1>
              {list.description && (
                <p className="mt-2 text-olive">{list.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-olive-light">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {list.created_by}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(list.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <ListActions slug={list.slug} />
          </div>
        </div>
      </div>

      {/* Items */}
      {list.items.length === 0 ? (
        <EmptyState type="lists" description="This list is empty. Add some items!" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.items.map((item) => (
            <div key={item.list_item_id} className="relative">
              <Card item={item} />
              {item.note && (
                <p className="mt-1.5 px-1 text-xs text-olive italic truncate">
                  &ldquo;{item.note}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add more CTA */}
      <div className="mt-8 text-center">
        <Link
          href={`/lists/new?add_from=${list.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors shadow-sm"
        >
          Add more items
        </Link>
      </div>
    </div>
  );
}
