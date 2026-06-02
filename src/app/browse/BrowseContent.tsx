'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, Loader2 } from 'lucide-react';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';

type TabType = 'movie' | 'book' | 'food';

const tabs: { key: TabType; label: string; icon: typeof Film }[] = [
  { key: 'movie', label: 'Movies', icon: Film },
  { key: 'book', label: 'Books', icon: BookOpen },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
];

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(initialType || 'movie');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async (tab: TabType, search: string, pageNum: number) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('type', tab);
      params.set('page', pageNum.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);

      const res = await fetch(`/api/items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      if (pageNum === 1) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
    } catch {
      setError('Failed to load items. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchItems(activeTab, searchQuery, 1);
  }, [activeTab, searchQuery, fetchItems]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(activeTab, searchQuery, nextPage);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 max-w-5xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Browse</h1>
      <p className="text-olive text-sm mb-6">Explore the best of everything.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-stone-200 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-primary text-white shadow-sm'
                  : 'text-olive hover:text-stone-600'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab === 'movie' ? 'movies' : activeTab === 'book' ? 'books' : 'food places'}...`}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => fetchItems(activeTab, searchQuery, 1)}
            className="mt-3 text-amber-primary text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Items grid */}
      {!error && (
        <>
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-amber-primary" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState type="search" />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:border-amber-primary/50 hover:text-amber-primary transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Loading...
                      </span>
                    ) : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
