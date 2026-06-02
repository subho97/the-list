import Link from 'next/link';
import { Film, BookOpen, UtensilsCrossed, Star, Share2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Item } from '@/lib/types';

async function getRecentItems(type: string, limit: number = 4): Promise<Item[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .order('added_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'movie') return <Film size={32} className="text-blue-500" />;
  if (type === 'book') return <BookOpen size={32} className="text-emerald-500" />;
  return <UtensilsCrossed size={32} className="text-orange-500" />;
}

export default async function Home() {
  const [movies, books, food] = await Promise.all([
    getRecentItems('movie'),
    getRecentItems('book'),
    getRecentItems('food'),
  ]);

  const categories = [
    { key: 'movie', items: movies, label: 'Movies', gradient: 'from-blue-500/10 to-blue-600/5', accent: 'text-blue-600' },
    { key: 'book', items: books, label: 'Books', gradient: 'from-emerald-500/10 to-emerald-600/5', accent: 'text-emerald-600' },
    { key: 'food', items: food, label: 'Food', gradient: 'from-orange-500/10 to-orange-600/5', accent: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-primary/[0.07] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-primary/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-xl mx-auto">
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1]">
            The List
          </h1>
          <p className="mt-5 text-xl md:text-2xl text-olive font-medium">
            Where the good things live.
          </p>
          <p className="mt-3 text-sm text-olive-light max-w-md mx-auto leading-relaxed">
            A shared collection of the best movies, books, and food places.
            Curated by everyone, for everyone.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/browse"
              className="px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-all duration-150 shadow-sm hover:shadow-md"
            >
              Start exploring
            </Link>
            <Link
              href="/add"
              className="px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:border-amber-primary/40 hover:text-amber-primary transition-all duration-150 shadow-sm"
            >
              Add something good
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-stone-900 text-center mb-10">
          How it works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Star size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">Only the best</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Movies need 7.0+ IMDB. Books and food places earn their spot through community reviews and recommendations.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Share2 size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">Share with anyone</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Create custom lists and share them via link. No login required. Everyone can add, everyone can explore.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Lock size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">You control your lists</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Protect your lists with a PIN. Anyone can view, but only you can edit. Your collection, your rules.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Additions */}
      {movies.length > 0 && (
        <section className="px-4 pb-20 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Recently added</h2>
            <Link href="/browse" className="text-sm text-amber-primary hover:text-amber-dark font-medium transition-colors duration-150">
              Browse all →
            </Link>
          </div>

          <div className="space-y-4">
            {categories.map(cat => (
              cat.items.length > 0 && (
                <div key={cat.key} className={`rounded-2xl p-4 bg-gradient-to-br ${cat.gradient} border border-stone-200/60`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TypeIcon type={cat.key} />
                    <h3 className={`font-semibold text-sm ${cat.accent}`}>{cat.label}</h3>
                  </div>
                  <div className="space-y-1.5">
                    {cat.items.slice(0, 3).map(item => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="block text-sm text-stone-700 hover:text-amber-primary transition-colors duration-150"
                      >
                        <span className="font-medium">{item.title}</span>
                        {item.external_rating && (
                          <span className="text-xs text-olive-light ml-2">
                            ⭐ {item.external_rating.toFixed(1)}
                          </span>
                        )}
                      </Link>
                    ))}
                    {cat.items.length > 3 && (
                      <Link
                        href={`/browse?type=${cat.key}`}
                        className="block text-xs text-olive hover:text-amber-primary transition-colors duration-150 mt-1"
                      >
                        +{cat.items.length - 3} more
                      </Link>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* Empty state CTA */}
      {movies.length === 0 && (
        <section className="px-4 pb-24 text-center">
          <p className="text-olive text-sm mb-4">No items yet. Be the first to add something!</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
          >
            Add the first item
          </Link>
        </section>
      )}

      {/* Footer note */}
      <section className="px-4 pb-20 text-center">
        <p className="text-xs text-olive-light">
          Made with ❤️ by people who love good things.
        </p>
      </section>
    </div>
  );
}
