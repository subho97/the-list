import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { List } from '@/lib/types';
import { Plus, Lock, Calendar, User, Search } from 'lucide-react';

interface ListWithPinInfo extends Omit<List, 'edit_pin'> {
  has_pin: boolean;
}

async function getLists(): Promise<ListWithPinInfo[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from('lists')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    return (data || []).map(({ edit_pin, ...rest }) => ({
      ...rest,
      has_pin: !!edit_pin,
    }));
  } catch {
    return [];
  }
}

async function getListItemCounts(): Promise<Map<string, number>> {
  try {
    const supabase = await createClient();
    if (!supabase) return new Map();

    const { data } = await supabase
      .from('list_items')
      .select('list_id');

    const counts = new Map<string, number>();
    (data || []).forEach((item: { list_id: string }) => {
      counts.set(item.list_id, (counts.get(item.list_id) || 0) + 1);
    });
    return counts;
  } catch {
    return new Map();
  }
}

export default async function ListsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const searchQuery = sp?.search || '';
  const allLists = await getLists();
  const lists = searchQuery
    ? allLists.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allLists;
  const itemCounts = await getListItemCounts();

  if (lists.length === 0) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-lg mx-auto text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">Lists</h1>
        <p className="text-olive text-sm mb-8">Curated collections from the community.</p>

        <div className="py-16">
          <p className="text-olive text-sm mb-6">No lists yet. Be the first to create one!</p>
          <Link
            href="/lists/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
          >
            <Plus size={18} />
            Create your first list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Lists</h1>
          <p className="text-olive text-sm mt-1">{searchQuery ? `Results for "${searchQuery}"` : 'Curated collections from the community.'}</p>
        </div>
        <Link
          href="/lists/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
        >
          <Plus size={16} />
          New List
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search lists..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary"
          />
        </div>
      </form>

      <div className="space-y-3">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/lists/${list.slug}`}
            className="block bg-white rounded-xl border border-stone-200 hover:border-amber-primary/30 hover:shadow-sm transition-all duration-150 p-5 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-stone-900 group-hover:text-amber-primary transition-colors duration-150">
                    {list.name}
                  </h2>
                  {list.has_pin && (
                    <Lock size={12} className="text-amber-primary shrink-0" aria-label="PIN-protected" />
                  )}
                  {'is_private' in list && (list as any).is_private && (
                    <span className="text-xs bg-stone-100 text-olive-light px-1.5 py-0.5 rounded">Private</span>
                  )}
                </div>
                {list.description && (
                  <p className="text-sm text-olive mt-1 line-clamp-2">{list.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-olive-light">
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {list.created_by}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(list.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                  <span>
                    {itemCounts.get(list.id) || 0} item{(itemCounts.get(list.id) || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
