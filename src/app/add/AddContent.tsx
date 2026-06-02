// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, BookOpen, UtensilsCrossed, Search, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { ItemType, MovieSearchResult, BookSearchResult, Item } from '@/lib/types';
import PhotoUpload from '@/components/PhotoUpload';

type Step = 'choose-type' | 'search' | 'detail' | 'confirm';

const typeConfig = {
  movie: { icon: Film, label: 'Movie', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
  book: { icon: BookOpen, label: 'Book', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
  food: { icon: UtensilsCrossed, label: 'Food Place', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
};

export default function AddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillType = searchParams.get('type') as ItemType | null;
  const [step, setStep] = useState<Step>(prefillType ? (prefillType === 'food' ? 'detail' : 'search') : 'choose-type');
  const [type, setType] = useState<ItemType | null>(prefillType);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(MovieSearchResult | BookSearchResult)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedItem, setSelectedItem] = useState<Partial<Item> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [addedBy, setAddedBy] = useState('');
  const [foodData, setFoodData] = useState({ title: '', creator: '', cuisine: '', description: '', city: '', year: new Date().getFullYear() });
  let searchTimeout: ReturnType<typeof setTimeout>;

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setStep(selectedType === 'food' ? 'detail' : 'search');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true); setSearchError('');
    try {
      const ep = type === 'movie' ? `/api/items/search?q=${encodeURIComponent(query)}` : `/api/items/search-books?q=${encodeURIComponent(query)}`;
      const res = await fetch(ep);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch { setSearchError('Search failed.'); }
    finally { setIsSearching(false); }
  };

  const handleMovieSelect = (result: MovieSearchResult) => {
    const rating = parseFloat(result.imdbRating);
    if (rating < 7.0) {
      setSearchError(`"${result.Title}" has IMDB ${rating} — doesn't meet The List's 7.0+ bar.`);
      return;
    }
    setSelectedItem({
      type: 'movie', title: result.Title, creator: result.Director || 'Unknown',
      year: parseInt(result.Year), description: result.Plot || null,
      image_url: result.Poster !== 'N/A' ? result.Poster : null,
      external_rating: rating, imdb_id: result.imdbID,
      genre: result.Genre ? result.Genre.split(',')[0].trim() : null,
      external_link: `https://www.imdb.com/title/${result.imdbID}`,
    });
    setStep('confirm');
  };

  const handleBookSelect = (result: BookSearchResult) => {
    setSelectedItem({
      type: 'book', title: result.volumeInfo.title,
      creator: result.volumeInfo.authors?.join(', ') || null,
      year: result.volumeInfo.publishedDate ? parseInt(result.volumeInfo.publishedDate.substring(0, 4)) : null,
      description: result.volumeInfo.description?.substring(0, 500) || null,
      image_url: result.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
      external_rating: result.volumeInfo.averageRating || null,
      external_link: result.volumeInfo.infoLink || null,
    });
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); setSubmitError('');
    try {
      let imageUrl = selectedItem?.image_url || null;
      if (type === 'food') {
        if (foodPhoto) {
          const fd = new FormData(); fd.append('file', foodPhoto);
          const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
          if (upRes.ok) { const upData = await upRes.json(); imageUrl = upData.url; }
        }
        // Generate reliable placeholder image based on cuisine
        if (!imageUrl) {
          const cuisine = (foodData.cuisine || foodData.creator || 'food').toLowerCase();
          let bg = 'FAF5E9', fg = '78716C';
          if (cuisine.includes('pizza') || cuisine.includes('italian') || cuisine.includes('pasta')) { bg = 'FEF3C7'; fg = 'D97706'; }
          else if (cuisine.includes('sushi') || cuisine.includes('japanese')) { bg = 'D1FAE5'; fg = '059669'; }
          else if (cuisine.includes('dimsum') || cuisine.includes('dumpling') || cuisine.includes('momo') || cuisine.includes('pan asian')) { bg = 'FCE7F3'; fg = 'BE185D'; }
          else if (cuisine.includes('bakery') || cuisine.includes('coffee') || cuisine.includes('cafe') || cuisine.includes('brunch') || cuisine.includes('tea')) { bg = 'FEF7E6'; fg = 'B45309'; }
          else if (cuisine.includes('burger')) { bg = 'FED7AA'; fg = '9A3412'; }
          else if (cuisine.includes('indian') || cuisine.includes('curry') || cuisine.includes('paratha') || cuisine.includes('naan') || cuisine.includes('litti')) { bg = 'FFEDD5'; fg = 'C2410C'; }
          else if (cuisine.includes('mediterranean') || cuisine.includes('shawarma') || cuisine.includes('kebab')) { bg = 'F0FDF4'; fg = '166534'; }
          else if (cuisine.includes('ramen') || cuisine.includes('noodle')) { bg = 'FEF2F2'; fg = '991B1B'; }
          else if (cuisine.includes('street') || cuisine.includes('food truck')) { bg = 'FFF7ED'; fg = '9A3412'; }
          else if (cuisine.includes('mexican') || cuisine.includes('taco')) { bg = 'DCFCE7'; fg = '15803D'; }
          imageUrl = `https://placehold.co/400x600/${bg}/${fg}?text=${encodeURIComponent(foodData.title.substring(0, 18))}&font=source-sans-pro`;
        }
      }
      const itemData = type === 'food'
        ? { type: 'food', title: foodData.title, creator: foodData.creator || foodData.cuisine, cuisine: foodData.cuisine || foodData.creator, description: foodData.description, city: foodData.city || null, image_url: imageUrl, added_by: addedBy.trim() || 'Anonymous' }
        : { ...selectedItem, image_url: imageUrl, added_by: addedBy.trim() || 'Anonymous' };
      const res = await fetch('/api/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      const newItem = await res.json();
      setAddedItemId(newItem.id);
      router.refresh();
    } catch (err) { setSubmitError(err.message || 'Something went wrong'); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setStep('choose-type'); setType(null); setSearchQuery(''); setSearchResults([]);
    setSearchError(''); setSelectedItem(null); setFoodPhoto(null); setAddedBy('');
    setFoodData({ title: '', creator: '', cuisine: '', description: '', city: '', year: new Date().getFullYear() });
    setAddedItemId(null);
  };

  if (addedItemId) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6"><Check size={36} className="text-emerald-600" /></div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Added to The List!</h2>
          <p className="text-olive text-sm mb-6">It&apos;s now part of the collection.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push(`/items/${addedItemId}`)} className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors">View item</button>
            <button onClick={resetForm} className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Add another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 max-w-lg mx-auto pb-24">
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">
        {type ? `Add ${typeConfig[type].label}` : 'Add to The List'}
      </h1>
      <p className="text-olive text-sm mb-6">Share something good with the world.</p>

      {/* Added by */}
      <div className="mb-6">
        <input
          type="text"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
          placeholder="Your name (optional — tags items to you)"
          maxLength={50}
          className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
        />
      </div>

      {step === 'choose-type' && (
        <div className="space-y-3">
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button key={key} onClick={() => handleTypeSelect(key)} className="w-full flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-200 hover:border-amber-primary/50 hover:bg-amber-primary/5 transition-all text-left group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}><Icon size={26} /></div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800">{config.label}</p>
                  <p className="text-sm text-olive-light mt-0.5">{key === 'movie' ? 'Search OMDb — only 7.0+ IMDB rated' : key === 'book' ? 'Search Google Books' : 'Manual entry with photo'}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light" />
            <input type="text" value={searchQuery} onChange={(e) => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => handleSearch(e.target.value), 400); setSearchQuery(e.target.value); }}
              placeholder={`Search ${type === 'movie' ? 'movies' : 'books'}...`} className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" autoFocus />
          </div>
          {searchError && <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{searchError}</p></div>}
          {isSearching && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-amber-primary" /></div>}
          {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && !searchError && <p className="text-center text-sm text-olive-light py-12">No results. Try a different search.</p>}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {searchResults.map((result) => {
              if (type === 'movie') {
                const rating = parseFloat(result.imdbRating);
                const isQualified = !isNaN(rating) && rating >= 7.0;
                return (
                  <button key={result.imdbID} onClick={() => isQualified && handleMovieSelect(result)} disabled={!isQualified}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isQualified ? 'border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 cursor-pointer' : 'border-red-100 bg-red-50/30 cursor-not-allowed opacity-70'}`}>
                    <img src={result.Poster !== 'N/A' ? result.Poster : '/placeholder.svg'} alt={result.Title} className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0" onError={(e) => { e.target.src = '/placeholder.svg'; }} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-stone-800 text-sm truncate">{result.Title}</p>
                      <p className="text-xs text-olive">{result.Year} · {result.Genre?.split(',')[0]}</p>
                      {isQualified && <p className="text-xs font-bold text-amber-primary mt-1">⭐ {rating.toFixed(1)}</p>}
                      {!isQualified && <p className="text-xs text-red-500 mt-1">IMDB {rating} — below 7.0</p>}
                    </div>
                  </button>
                );
              }
              return (
                <button key={result.id} onClick={() => handleBookSelect(result)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all text-left">
                  {result.volumeInfo.imageLinks?.thumbnail ? <img src={result.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} alt={result.volumeInfo.title} className="w-12 h-16 object-cover rounded-lg shrink-0 bg-stone-100" /> : <div className="w-12 h-16 rounded-lg bg-stone-100 flex items-center justify-center text-olive-light text-[10px] uppercase shrink-0">Book</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{result.volumeInfo.title}</p>
                    <p className="text-xs text-olive truncate">{result.volumeInfo.authors?.join(', ')}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => { setStep('choose-type'); setType(null); }} className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
        </div>
      )}

      {step === 'detail' && type === 'food' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
            <input type="text" value={foodData.title} onChange={(e) => setFoodData({ ...foodData, title: e.target.value })} placeholder="Restaurant or place name" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Cuisine / Category</label>
            <input type="text" value={foodData.cuisine} onChange={(e) => setFoodData({ ...foodData, cuisine: e.target.value })} placeholder="e.g. Italian, Japanese, Street Food" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">City / Area <span className="text-olive-light font-normal">(optional)</span></label>
            <input type="text" value={foodData.city} onChange={(e) => setFoodData({ ...foodData, city: e.target.value })} placeholder="e.g. Bangalore, HSR Layout" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-olive-light font-normal">(optional)</span></label>
            <textarea value={foodData.description} onChange={(e) => setFoodData({ ...foodData, description: e.target.value })} placeholder="What makes this place special?" rows={3} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary resize-none" />
          </div>
          <PhotoUpload onFileSelect={setFoodPhoto} />
          <p className="text-xs text-olive-light">No photo? We&apos;ll use a color-coded cuisine placeholder.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setStep('choose-type'); setType(null); }} className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
            <button onClick={() => { setSelectedItem({ type: 'food', title: foodData.title, creator: foodData.cuisine || foodData.creator, description: foodData.description, city: foodData.city }); setStep('confirm'); }} disabled={!foodData.title} className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark disabled:opacity-50 disabled:cursor-not-allowed">Preview & Add</button>
          </div>
        </div>
      )}

      {step === 'confirm' && selectedItem && (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-white border border-stone-200">
            {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.title || ''} className="w-20 h-28 object-cover rounded-lg shrink-0 bg-stone-100" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-800">{selectedItem.title}</h3>
              {selectedItem.creator && <p className="text-sm text-olive mt-0.5">{selectedItem.creator}</p>}
              {selectedItem.external_rating && <p className="text-xs font-bold text-amber-primary bg-amber-primary/10 inline-block px-2 py-0.5 rounded-full mt-1">⭐ {selectedItem.external_rating.toFixed(1)}</p>}
              {selectedItem.description && <p className="text-xs text-olive-light mt-2 line-clamp-3">{selectedItem.description}</p>}
            </div>
          </div>
          {submitError && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"><AlertCircle size={16} className="inline mr-1" />{submitError}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep(type === 'food' ? 'detail' : 'search')} className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : 'Add to The List'}
            </button>
          </div>
          {type === 'movie' && <p className="text-[11px] text-olive-light text-center">Only movies with 7.0+ IMDB rating are accepted.</p>}
          {type === 'food' && <p className="text-[11px] text-olive-light text-center">Color-coded placeholder by cuisine if no photo.</p>}
        </div>
      )}
    </div>
  );
}
