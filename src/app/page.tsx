import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Item } from '@/lib/types';
import HomeItems from './HomeItems';

async function getRecentItems(type: string, limit: number = 6): Promise<Item[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('type', type)
    .order('added_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export default async function Home() {
  const [movies, books, food] = await Promise.all([
    getRecentItems('movie'),
    getRecentItems('book'),
    getRecentItems('food'),
  ]);

  const hasItems = movies.length > 0 || books.length > 0 || food.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-primary/5 to-transparent pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 tracking-tight">
            The List
          </h1>
          <p className="mt-3 text-lg md:text-xl text-olive font-medium">
            Where the good things live.
          </p>
          <p className="mt-2 text-sm text-olive-light max-w-md mx-auto">
            A shared collection of the best movies, books, and food places. Curated by everyone.
          </p>
          {!hasItems && (
            <Link
              href="/add"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors shadow-sm"
            >
              Add the first item →
            </Link>
          )}
        </div>
      </section>

      {/* Items */}
      <HomeItems movies={movies} books={books} food={food} />
    </div>
  );
}
