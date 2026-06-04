'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, Loader2 } from 'lucide-react';

function TypeIcon({ type }: { type: string }) {
  if (type === 'movie') return <Film size={32} className="text-blue-500" />;
  if (type === 'book') return <BookOpen size={32} className="text-emerald-500" />;
  return <UtensilsCrossed size={32} className="text-orange-500" />;
}

interface CategoryData {
  key: string;
  items: Item[];
  label: string;
  gradient: string;
  accent: string;
}

export default function RecentItems() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const [movies, books, food] = await Promise.all([
          fetch('/api/items?type=movie&limit=4').then(r => r.json()).then(d => d.items || []),
          fetch('/api/items?type=book&limit=4').then(r => r.json()).then(d => d.items || []),
          fetch('/api/items?type=food&limit=4').then(r => r.json()).then(d => d.items || []),
        ]);

        setCategories([
          { key: 'movie', items: movies, label: 'Movies', gradient: 'from-blue-500/10 to-blue-600/5', accent: 'text-blue-600' },
          { key: 'book', items: books, label: 'Books', gradient: 'from-emerald-500/10 to-emerald-600/5', accent: 'text-emerald-600' },
          { key: 'food', items: food, label: 'Food', gradient: 'from-orange-500/10 to-orange-600/5', accent: 'text-orange-600' },
        ]);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  if (loading) {
    return (
      <section className="px-4 pb-20 max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-olive-light">
          <Loader2 size={16} className="animate-spin" />
          Loading recent additions...
        </div>
      </section>
    );
  }

  const hasAny = categories.some(c => c.items.length > 0);

  if (!hasAny) {
    return (
      <section className="px-4 pb-24 text-center">
        <p className="text-olive text-sm mb-4">No items yet. Be the first to add something!</p>
        <Link
          href="/add"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
        >
          Add the first item
        </Link>
      </section>
    );
  }

  return (
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
                {cat.items.slice(0, 3).map((item: Item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="block text-sm text-stone-700 hover:text-amber-primary transition-colors duration-150"
                  >
                    <span className="font-medium">{item.title}</span>
                    {item.external_rating && item.type !== 'book' && (
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
  );
}
