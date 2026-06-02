'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, Loader2, MapPin, Star, Filter, Plus } from 'lucide-react';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';

type TabType = 'movie' | 'book' | 'food';

const tabs: { key: TabType; label: string; icon: typeof Film }[] = [
  { key: 'movie', label: 'Movies', icon: Film },
  { key: 'book', label: 'Books', icon: BookOpen },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
];

const RATING_OPTIONS = [
  { label: 'All ratings', value: '' },
  { label: '7.0+', value: '7' },
  { label: '7.5+', value: '7.5' },
  { label: '8.0+', value: '8' },
  { label: '8.5+', value: '8.5' },
  { label: '9.0+', value: '9' },
];

export default function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(initialType || 'movie');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  // On tab change: clear items immediately, reset page, start loading
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setItems([]);
    setPage(1);
    setError('');
    setIsLoading(true);
    setSearchQuery('');
    setCityFilter('');
    setGenreFilter('');
    setMinRating('');
  };

  const fetchItems = useCallback(async (tab: TabType, search: string, pageNum: number) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('type', tab);
      params.set('page', pageNum.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (tab === 'food' && cityFilter) params.set('city', cityFilter);
      if (tab === 'movie' && genreFilter) params.set('genre', genreFilter);
      if (tab === 'movie' && minRating) params.set('minRating', minRating);

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
  }, [cityFilter, genreFilter, minRating]);

  useEffect(() => {
    fetchItems(activeTab, searchQuery, 1);
  }, [activeTab, searchQuery, cityFilter, genreFilter, minRating, fetchItems]);

  // Fetch cities for food
  useEffect(() => {
    if (activeTab === 'food') {
      fetch('/api/cities').then(r => r.json()).then(d => setCities(d.cities || [])).catch(() => {});
    }
  }, [activeTab]);

  // Fetch genres for movies
  useEffect(() => {
    if (activeTab === 'movie') {
      fetch('/api/genres').then(r => r.json()).then(d => setGenres(d.genres || [])).catch(() => {});
    }
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(activeTab, searchQuery, nextPage);
  };

  const addPageUrl = `/add?type=${activeTab}`;

  return (
    <div className="min-h-screen pt-24 md:pt-28 px-4 max-w-5xl mx-auto pb-24">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">Browse</h1>
      <p className="text-olive text-sm mb-6">Explore the best of everything.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-stone-200 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-primary text-white shadow-sm'
                  : 'text-olive hover:text-stone-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab === 'movie' ? 'movies' : activeTab === 'book' ? 'books' : 'food places'}...`}
        />
      </div>

      {/* Movie disclaimer */}
      {activeTab === 'movie' && (
        <p className="text-xs text-olive-light mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-primary" />
          Only movies with 7.0+ IMDB rating make the cut
        </p>
      )}

      {/* Movie filters */}
      {activeTab === 'movie' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Genre filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={genreFilter}
              onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All genres</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Rating filter - dropdown */}
          <div className="relative">
            <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              {RATING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* City filter (food only) */}
      {activeTab === 'food' && cities.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-olive-light" />
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => fetchItems(activeTab, searchQuery, 1)}
            className="mt-3 text-amber-primary text-sm font-medium hover:text-amber-dark transition-colors duration-150"
          >
            Try again
          </button>
        </div>
      )}

      {/* Items grid */}
      {!error && (
        <>
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-amber-primary" />
            </div>
          ) : items.length === 0 && !isLoading ? (
            <EmptyState type="search" />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:border-amber-primary/40 hover:text-amber-primary transition-all duration-150 disabled:opacity-50 shadow-sm"
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

      {/* Floating add button */}
      <button
        onClick={() => router.push(addPageUrl)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-amber-primary text-white shadow-lg hover:bg-amber-dark hover:shadow-xl hover:scale-105 transition-all duration-150 flex items-center justify-center"
        aria-label={`Add ${activeTab}`}
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
