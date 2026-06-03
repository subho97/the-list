'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, Loader2, MapPin, Star, Filter, Plus, Map, List } from 'lucide-react';
import Card from '@/components/Card';
import FoodListItem from '@/components/FoodListItem';
import MapView from '@/components/MapView';
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
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [genreFilter, setGenreFilter] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [moodFilter, setMoodFilter] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const restoredScroll = useRef(false);

  // Disable browser's automatic scroll restoration — we handle it ourselves
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Save scroll position and active tab when any link is clicked (capture phase)
  useEffect(() => {
    const handler = () => {
      sessionStorage.setItem('browseScrollY', String(window.scrollY));
      sessionStorage.setItem('browseActiveTab', activeTab);
    };
    // Capture clicks on the document to save scroll before navigation happens
    document.addEventListener('click', handler, true); // true = capture phase
    return () => document.removeEventListener('click', handler, true);
  }, [activeTab]);

  // After data finishes loading, restore saved scroll position
  useEffect(() => {
    if (isLoading || items.length === 0 || restoredScroll.current) return;
    
    const savedScroll = sessionStorage.getItem('browseScrollY');
    const savedTab = sessionStorage.getItem('browseActiveTab');
    
    // Only restore if the saved tab matches the current active tab
    if (savedTab !== activeTab || !savedScroll) return;
    
    const y = parseInt(savedScroll);
    if (isNaN(y)) return;
    
    restoredScroll.current = true;
    
    // Double rAF to ensure DOM has fully painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'instant' });
      });
    });
  }, [isLoading, items, activeTab]);

  // Clear saved position when user scrolls manually after restore
  useEffect(() => {
    if (!restoredScroll.current) return;
    const handleScroll = () => {
      sessionStorage.removeItem('browseScrollY');
      sessionStorage.removeItem('browseActiveTab');
      restoredScroll.current = false;
    };
    window.addEventListener('scroll', handleScroll, { once: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [restoredScroll.current]);

  // Save scroll and tab manually (also used for click handler)
  const saveScrollAndTab = () => {
    sessionStorage.setItem('browseScrollY', String(window.scrollY));
    sessionStorage.setItem('browseActiveTab', activeTab);
  };

  // On tab change: clear items immediately, reset page, start loading
  const handleTabChange = (tab: TabType) => {
    // Clear saved scroll — user is navigating to a new tab, not coming back
    sessionStorage.removeItem('browseScrollY');
    sessionStorage.removeItem('browseActiveTab');
    restoredScroll.current = false;
    
    setActiveTab(tab);
    setItems([]);
    setPage(1);
    setError('');
    setIsLoading(true);
    setSearchQuery('');
    setCityFilter('');
    setCuisineFilter('');
    setGenreFilter('');
    setMoodFilter('');
    setMinRating('');
    router.replace(`/browse?type=${tab}`, { scroll: false });
  };

  const fetchItems = useCallback(async (tab: TabType, search: string, pageNum: number) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('type', tab);
      params.set('page', pageNum.toString());
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (tab === 'food' && cityFilter) params.set('city', cityFilter);
      if (tab === 'food' && cuisineFilter) params.set('cuisine', cuisineFilter);
      if (tab === 'movie' && genreFilter) params.set('genre', genreFilter);
      if (tab === 'movie' && moodFilter) params.set('mood', moodFilter);
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
  }, [cityFilter, cuisineFilter, genreFilter, moodFilter, minRating]);

  useEffect(() => {
    fetchItems(activeTab, searchQuery, 1);
  }, [activeTab, searchQuery, cityFilter, cuisineFilter, genreFilter, moodFilter, minRating, fetchItems]);

  // Fetch cities and cuisines for food
  useEffect(() => {
    if (activeTab === 'food') {
      fetch('/api/cities').then(r => r.json()).then(d => setCities(d.cities || [])).catch(() => {});
      fetch('/api/cuisines').then(r => r.json()).then(d => setCuisines(d.cuisines || [])).catch(() => {});
    }
  }, [activeTab]);

  // Fetch genres and moods
  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'book') {
      fetch('/api/genres').then(r => r.json()).then(d => setGenres(d.genres || [])).catch(() => {});
    }
    if (activeTab === 'movie') {
      fetch('/api/moods').then(r => r.json()).then(d => setMoods(d.moods || [])).catch(() => {});
    }
  }, [activeTab]);

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(activeTab, searchQuery, nextPage);
  };

  // Refs for IntersectionObserver to avoid stale closures
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const activeTabRef = useRef(activeTab);
  const searchQueryRef = useRef(searchQuery);
  const fetchItemsRef = useRef(fetchItems);

  pageRef.current = page;
  hasMoreRef.current = hasMore;
  isLoadingRef.current = isLoading;
  activeTabRef.current = activeTab;
  searchQueryRef.current = searchQuery;
  fetchItemsRef.current = fetchItems;

  // Infinite scroll — auto-load when near bottom
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    let busy = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !busy) {
        busy = true;
        if (hasMoreRef.current && !isLoadingRef.current) {
          const nextPage = pageRef.current + 1;
          setPage(nextPage);
          fetchItemsRef.current(activeTabRef.current, searchQueryRef.current, nextPage);
        }
        setTimeout(() => { busy = false; }, 1000);
      }
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []); // Only mount/unmount — refs keep callback current

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

      {/* Movie filters */}
      {activeTab === 'movie' && (
        <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-1 -mx-1 px-1">
          {/* Genre filter */}
          <div className="relative shrink-0">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={genreFilter}
              onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All genres</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Rating filter - dropdown */}
          <div className="relative shrink-0">
            <Star size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              {RATING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mood filter - dropdown */}
          <div className="relative shrink-0">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-olive-light pointer-events-none">🎭</span>
            <select
              value={moodFilter}
              onChange={(e) => { setMoodFilter(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All moods</option>
              {moods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Book filters */}
      {activeTab === 'book' && (
        <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-1 -mx-1 px-1">
          {/* Genre filter */}
          <div className="relative shrink-0">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={genreFilter}
              onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All genres</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Rating filter - dropdown */}
          <div className="relative shrink-0">
            <Star size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              {RATING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* City + Cuisine filters (food only) */}
      {activeTab === 'food' && (
        <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-1 -mx-1 px-1">
          {/* City filter */}
          <div className="relative shrink-0">
            <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Cuisine filter */}
          {cuisines.length > 0 && (
            <div className="relative shrink-0">
              <UtensilsCrossed size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
              <select
                value={cuisineFilter}
                onChange={(e) => { setCuisineFilter(e.target.value); setPage(1); }}
                className="pl-7 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
              >
                <option value="">All cuisines</option>
                {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Map/List toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:border-amber-primary/40 hover:text-amber-primary transition-all duration-150"
          >
            {viewMode === 'list' ? <><Map size={14} /> Map</> : <><List size={14} /> List</>}
          </button>
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
            <div className="min-h-[400px] flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-amber-primary" />
            </div>
          ) : items.length === 0 && !isLoading ? (
            <EmptyState type="search" />
          ) : (
            <>
              {activeTab === 'food' && viewMode === 'map' ? (
                <MapView items={items} />
              ) : (
                <div className={activeTab === 'food' ? 'space-y-3' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch'}>
                  {items.map((item) =>
                    activeTab === 'food' ? (
                      <FoodListItem key={item.id} item={item} />
                    ) : (
                      <Card key={item.id} item={item} />
                    )
                  )}
                </div>
              )}

              {hasMore && (
                <>
                  <div ref={sentinelRef} className="h-4" />
                  <div className="mt-4 text-center">
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
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Floating add button */}
      <button
        onClick={() => router.push(addPageUrl)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 rounded-full bg-amber-primary text-white shadow-lg hover:bg-amber-dark hover:shadow-xl hover:scale-105 transition-all duration-150 flex items-center justify-center"
        aria-label={`Add ${activeTab}`}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
