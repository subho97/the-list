// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';

// Extract area/neighborhood from Google Maps URL
function extractAreaFromLink(url) {
  if (!url) return '';
  // Try to extract from place name in URL
  const match = url.match(/place\/([^/]+)/i) || url.match(/\/([^/]+)\/@/);
  if (match) {
    const place = decodeURIComponent(match[1].replace(/\+/g, ' '));
    // Check for common Bangalore area names
    const areas = ['HSR Layout', 'BTM Layout', 'Koramangala', 'Indiranagar', 'Jayanagar',
      'JP Nagar', 'Whitefield', 'Marathahalli', 'Electronic City', 'Banashankari',
      'MG Road', 'Brigade Road', 'Church Street', 'Basavanagudi', 'Malleshwaram',
      'Rajajinagar', 'Yelahanka', 'Hebbal', 'Kalyan Nagar', 'Sarjapur Road',
      'Bellandur', 'Hennur', 'RT Nagar', 'Sadashivanagar', 'Domlur',
      'Vijayanagar', 'Mysore City', 'Gokulam', 'Kuvempunagar', 'Jayanagar (Mysore)'];
    for (const area of areas) {
      if (place.toLowerCase().includes(area.toLowerCase())) return area;
    }
  }
  return '';
}
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
  const [step, setStep] = useState<Step>('choose-type');
  const [type, setType] = useState<ItemType | null>(null);
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
  const [purchaseLink, setPurchaseLink] = useState('');
  const [foodData, setFoodData] = useState({ title: '', creator: '', cuisine: '', must_try: '', notes: '', description: '', city: '', area: '', google_maps_link: '', year: new Date().getFullYear() });
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const foodSuggestTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const foodSearchedRef = useRef(false);
  const [foodSuggestions, setFoodSuggestions] = useState<Array<{name: string; area: string; city: string; maps_link: string}>>([]);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  useEffect(() => {
    if (prefillType) {
      setType(prefillType);
      setStep(prefillType === 'food' ? 'detail' : 'search');
    }
  }, [prefillType]);

  const searchFoodPlace = async (query: string) => {
    try {
      const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setFoodSuggestions(data.results || []);
      setShowFoodSuggestions((data.results || []).length > 0);
    } catch {
      setFoodSuggestions([]);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handler = () => setShowFoodSuggestions(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    setSelectedItem({
      type: 'movie', title: result.Title, creator: result.Director || 'Unknown',
      year: parseInt(result.Year), description: result.Plot || null,
      image_url: result.Poster !== 'N/A' ? result.Poster : null,
      external_rating: rating, imdb_id: result.imdbID,
      genre: result.Genre ? result.Genre.split(',')[0].trim() : null,
      mood: null,
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
      genre: result.volumeInfo.categories?.[0] || null,
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
        ? { type: 'food', title: foodData.title, creator: foodData.creator || foodData.cuisine, cuisine: foodData.cuisine || foodData.creator, must_try: foodData.must_try || null, notes: foodData.notes || null, description: foodData.description, city: foodData.city || null, area: (foodData.area || extractAreaFromLink(foodData.google_maps_link)), google_maps_link: foodData.google_maps_link || null, image_url: imageUrl, added_by: addedBy.trim() || 'Anonymous' }
        : { ...selectedItem, image_url: imageUrl, added_by: addedBy.trim() || 'Anonymous' };
      if (purchaseLink.trim()) itemData.purchase_link = purchaseLink.trim();
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
    setFoodData({ title: '', creator: '', cuisine: '', must_try: '', notes: '', description: '', city: '', area: '', google_maps_link: '', year: new Date().getFullYear() });
    setAddedItemId(null);
    setPurchaseLink('');
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
                  <p className="text-sm text-olive-light mt-0.5">{key === 'movie' ? 'Search movies by title' : key === 'book' ? 'Search books by title' : 'Manual entry with photo'}</p>
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
            <input type="text" value={searchQuery} onChange={(e) => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); searchTimeoutRef.current = setTimeout(() => handleSearch(e.target.value), 400); setSearchQuery(e.target.value); }}
              placeholder={`Search ${type === 'movie' ? 'movies' : 'books'}...`} className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" autoFocus />
          </div>
          {searchError && <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{searchError}</p></div>}
          {isSearching && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-amber-primary" /></div>}
          {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && !searchError && (
            <div className="text-center py-8">
              <p className="text-sm text-olive-light mb-3">No results.</p>
              {type === 'book' && (
                <button
                  onClick={() => {
                    setSelectedItem({
                      type: 'book',
                      title: searchQuery,
                      creator: null,
                      year: null,
                      description: null,
                      image_url: null,
                      external_rating: null,
                      external_link: null,
                      genre: null,
                    });
                    setStep('confirm');
                  }}
                  className="text-sm font-medium text-amber-primary hover:text-amber-dark transition-colors"
                >
                  Can&apos;t find your book? Add &ldquo;{searchQuery}&rdquo; manually
                </button>
              )}
            </div>
          )}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {searchResults.map((result) => {
              if (type === 'movie') {
                const rating = parseFloat(result.imdbRating);
                return (
                  <button key={result.imdbID} onClick={() => handleMovieSelect(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all text-left cursor-pointer">
                    <img src={result.Poster !== 'N/A' ? result.Poster : '/placeholder.svg'} alt={result.Title} className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0" loading="lazy" onError={(e) => { e.target.src = '/placeholder.svg'; }} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-stone-800 text-sm truncate">{result.Title}</p>
                      <p className="text-xs text-olive">{result.Year} · {result.Genre?.split(',')[0]}</p>
                      {!isNaN(rating) && <p className="text-xs font-bold text-amber-primary mt-1">⭐ {rating.toFixed(1)}</p>}
                    </div>
                  </button>
                );
              }
              return (
                <button key={result.id} onClick={() => handleBookSelect(result)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all text-left">
                  {result.volumeInfo.imageLinks?.thumbnail ? <img src={result.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} alt={result.volumeInfo.title} className="w-12 h-16 object-cover rounded-lg shrink-0 bg-stone-100" loading="lazy" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div className="w-12 h-16 rounded-lg bg-stone-100 flex items-center justify-center text-olive-light text-[10px] uppercase shrink-0">Book</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{result.volumeInfo.title}</p>
                    <p className="text-xs text-olive truncate">{result.volumeInfo.authors?.join(', ')}</p>
                  </div>
                </button>
              );
            })}
            {type === 'book' && searchQuery.length >= 2 && (
              <div className="border-t border-stone-100 pt-3 mt-1">
                <button
                  onClick={() => {
                    setSelectedItem({
                      type: 'book',
                      title: searchQuery,
                      creator: null,
                      year: null,
                      description: null,
                      image_url: null,
                      external_rating: null,
                      external_link: null,
                      genre: null,
                    });
                    setStep('confirm');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-stone-200 hover:border-amber-primary/40 hover:bg-stone-50 transition-all text-left"
                >
                  <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-olive-light text-[18px] shrink-0">
                    ✏️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-700 text-sm">Add &ldquo;{searchQuery}&rdquo; manually</p>
                    <p className="text-xs text-olive-light mt-0.5">Enter book details yourself</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          <button onClick={() => { setStep('choose-type'); setType(null); }} className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
        </div>
      )}

      {step === 'detail' && type === 'food' && (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={foodData.title}
              onChange={(e) => {
                setFoodData({ ...foodData, title: e.target.value });
                if (foodSuggestTimeoutRef.current) clearTimeout(foodSuggestTimeoutRef.current);
                if (e.target.value.length >= 2) {
                  foodSuggestTimeoutRef.current = setTimeout(() => searchFoodPlace(e.target.value), 300);
                } else {
                  setFoodSuggestions([]);
                }
              }}
              onFocus={() => { if (foodSearchedRef.current && foodSuggestions.length > 0) setShowFoodSuggestions(true); }}
              placeholder="Start typing a restaurant or place name..."
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary"
              autoFocus
              autoComplete="off"
            />
            {/* Autocomplete dropdown */}
            {showFoodSuggestions && foodSuggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg max-h-64 overflow-y-auto">
                {foodSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => {
                      setFoodData({
                        ...foodData,
                        title: s.name,
                        city: s.city || foodData.city,
                        area: s.area || foodData.area,
                        google_maps_link: s.maps_link || foodData.google_maps_link,
                      });
                      setShowFoodSuggestions(false);
                      foodSearchedRef.current = true;
                    }}
                    className="w-full flex items-start gap-3 p-3 text-left hover:bg-amber-50/50 transition-colors border-b border-stone-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-orange-200/60 to-orange-300/30 flex items-center justify-center text-sm">
                      🍽️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{s.name}</p>
                      <p className="text-xs text-olive-light truncate mt-0.5">
                        {s.area && `${s.area}, `}{s.city || ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Cuisine / Category *</label>
            <select
              value={foodData.cuisine}
              onChange={(e) => setFoodData({ ...foodData, cuisine: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">Select cuisine...</option>
              <option value="American">American</option>
              <option value="Arabian">Arabian</option>
              <option value="Argentinian">Argentinian</option>
              <option value="BBQ">BBQ</option>
              <option value="Bakery">Bakery</option>
              <option value="Biryani">Biryani</option>
              <option value="Brazilian">Brazilian</option>
              <option value="Breakfast">Breakfast</option>
              <option value="British">British</option>
              <option value="Brunch">Brunch</option>
              <option value="Burgers">Burgers</option>
              <option value="Cafe">Cafe</option>
              <option value="Cajun">Cajun</option>
              <option value="Caribbean">Caribbean</option>
              <option value="Chinese">Chinese</option>
              <option value="Dessert">Dessert</option>
              <option value="Dimsum">Dimsum</option>
              <option value="Ethiopian">Ethiopian</option>
              <option value="Filipino">Filipino</option>
              <option value="Food Truck">Food Truck</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Greek">Greek</option>
              <option value="Grill">Grill</option>
              <option value="Healthy">Healthy</option>
              <option value="Ice Cream">Ice Cream</option>
              <option value="Indian Street Food">Indian Street Food</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Kebab">Kebab</option>
              <option value="Korean">Korean</option>
              <option value="Lebanese">Lebanese</option>
              <option value="Litti Chokha">Litti Chokha</option>
              <option value="Malaysian">Malaysian</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Mexican">Mexican</option>
              <option value="Middle Eastern">Middle Eastern</option>
              <option value="Momos">Momos</option>
              <option value="Moroccan">Moroccan</option>
              <option value="Mughlai">Mughlai</option>
              <option value="Nigerian">Nigerian</option>
              <option value="Noodles">Noodles</option>
              <option value="North African">North African</option>
              <option value="North Indian">North Indian</option>
              <option value="Pan Asian">Pan Asian</option>
              <option value="Persian">Persian</option>
              <option value="Peruvian">Peruvian</option>
              <option value="Pizza">Pizza</option>
              <option value="Polish">Polish</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Ramen">Ramen</option>
              <option value="Russian">Russian</option>
              <option value="Sandwiches">Sandwiches</option>
              <option value="Seafood">Seafood</option>
              <option value="Shawarma">Shawarma</option>
              <option value="South Indian">South Indian</option>
              <option value="Southern">Southern</option>
              <option value="Spanish">Spanish</option>
              <option value="Steak">Steak</option>
              <option value="Street Food">Street Food</option>
              <option value="Sushi">Sushi</option>
              <option value="Taiwanese">Taiwanese</option>
              <option value="Tex-Mex">Tex-Mex</option>
              <option value="Thai">Thai</option>
              <option value="Tibetan">Tibetan</option>
              <option value="Turkish">Turkish</option>
              <option value="Vegan">Vegan</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">✨ Must try <span className="text-olive-light font-normal">(dish to order)</span></label>
            <input type="text" value={foodData.must_try} onChange={(e) => setFoodData({ ...foodData, must_try: e.target.value })} placeholder="e.g. Butter Chicken, Sushi Platter" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">📝 Notes <span className="text-olive-light font-normal">(timings, location hints, etc.)</span></label>
            <input type="text" value={foodData.notes} onChange={(e) => setFoodData({ ...foodData, notes: e.target.value })} placeholder="e.g. No Dine-in. Only Order. Opens at 4AM." className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">City *</label>
            <select
              value={foodData.city}
              onChange={(e) => setFoodData({ ...foodData, city: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
            >
              <option value="">Select city...</option>
              <option value="Adilabad">Adilabad</option>
              <option value="Agartala">Agartala</option>
              <option value="Agra">Agra</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Ahmednagar">Ahmednagar</option>
              <option value="Aizawl">Aizawl</option>
              <option value="Ajmer">Ajmer</option>
              <option value="Akola">Akola</option>
              <option value="Alappuzha">Alappuzha</option>
              <option value="Aligarh">Aligarh</option>
              <option value="Allahabad">Allahabad</option>
              <option value="Alwar">Alwar</option>
              <option value="Amaravati">Amaravati</option>
              <option value="Amravati">Amravati</option>
              <option value="Amritsar">Amritsar</option>
              <option value="Anantapur">Anantapur</option>
              <option value="Angul">Angul</option>
              <option value="Arrah">Arrah</option>
              <option value="Asansol">Asansol</option>
              <option value="Aurangabad">Aurangabad</option>
              <option value="Avadi">Avadi</option>
              <option value="Bahadurgarh">Bahadurgarh</option>
              <option value="Baharampur">Baharampur</option>
              <option value="Bahraich">Bahraich</option>
              <option value="Balasore">Balasore</option>
              <option value="Ballia">Ballia</option>
              <option value="Banda">Banda</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Bankura">Bankura</option>
              <option value="Baranagar">Baranagar</option>
              <option value="Barasat">Barasat</option>
              <option value="Bardhaman">Bardhaman</option>
              <option value="Bareilly">Bareilly</option>
              <option value="Barrackpore">Barrackpore</option>
              <option value="Bathinda">Bathinda</option>
              <option value="Begusarai">Begusarai</option>
              <option value="Belagavi">Belagavi</option>
              <option value="Bellary">Bellary</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Berhampur">Berhampur</option>
              <option value="Bettiah">Bettiah</option>
              <option value="Bhagalpur">Bhagalpur</option>
              <option value="Bharatpur">Bharatpur</option>
              <option value="Bharuch">Bharuch</option>
              <option value="Bhavnagar">Bhavnagar</option>
              <option value="Bhilai">Bhilai</option>
              <option value="Bhilwara">Bhilwara</option>
              <option value="Bhiwandi">Bhiwandi</option>
              <option value="Bhiwani">Bhiwani</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
              <option value="Bhuj">Bhuj</option>
              <option value="Bidar">Bidar</option>
              <option value="Bihar Sharif">Bihar Sharif</option>
              <option value="Bijapur">Bijapur</option>
              <option value="Bikaner">Bikaner</option>
              <option value="Bilaspur">Bilaspur</option>
              <option value="Bokaro">Bokaro</option>
              <option value="Bulandshahr">Bulandshahr</option>
              <option value="Burhanpur">Burhanpur</option>
              <option value="Calicut">Calicut</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Chandrapur">Chandrapur</option>
              <option value="Chapra">Chapra</option>
              <option value="Chennai">Chennai</option>
              <option value="Chhindwara">Chhindwara</option>
              <option value="Chittoor">Chittoor</option>
              <option value="Churu">Churu</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Cuddalore">Cuddalore</option>
              <option value="Cuttack">Cuttack</option>
              <option value="Dahod">Dahod</option>
              <option value="Daman">Daman</option>
              <option value="Damoh">Damoh</option>
              <option value="Darbhanga">Darbhanga</option>
              <option value="Darjeeling">Darjeeling</option>
              <option value="Davanagere">Davanagere</option>
              <option value="Dehradun">Dehradun</option>
              <option value="Delhi">Delhi</option>
              <option value="Deoghar">Deoghar</option>
              <option value="Dewas">Dewas</option>
              <option value="Dhanbad">Dhanbad</option>
              <option value="Dharamshala">Dharamshala</option>
              <option value="Dharwad">Dharwad</option>
              <option value="Dholpur">Dholpur</option>
              <option value="Dhule">Dhule</option>
              <option value="Dibrugarh">Dibrugarh</option>
              <option value="Dindigul">Dindigul</option>
              <option value="Diu">Diu</option>
              <option value="Dombivli">Dombivli</option>
              <option value="Durgapur">Durgapur</option>
              <option value="Dwarka">Dwarka</option>
              <option value="Eluru">Eluru</option>
              <option value="Erode">Erode</option>
              <option value="Etawah">Etawah</option>
              <option value="Faizabad">Faizabad</option>
              <option value="Firozabad">Firozabad</option>
              <option value="Firozpur">Firozpur</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Gandhidham">Gandhidham</option>
              <option value="Gangtok">Gangtok</option>
              <option value="Gaya">Gaya</option>
              <option value="Ghaziabad">Ghaziabad</option>
              <option value="Ghazipur">Ghazipur</option>
              <option value="Giridih">Giridih</option>
              <option value="Goa">Goa</option>
              <option value="Gonda">Gonda</option>
              <option value="Gorakhpur">Gorakhpur</option>
              <option value="Gulbarga">Gulbarga</option>
              <option value="Guntur">Guntur</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Guwahati">Guwahati</option>
              <option value="Gwalior">Gwalior</option>
              <option value="Hajipur">Hajipur</option>
              <option value="Haldwani">Haldwani</option>
              <option value="Haldia">Haldia</option>
              <option value="Hamirpur">Hamirpur</option>
              <option value="Haridwar">Haridwar</option>
              <option value="Hassan">Hassan</option>
              <option value="Hathras">Hathras</option>
              <option value="Hazaribagh">Hazaribagh</option>
              <option value="Hingoli">Hingoli</option>
              <option value="Hisar">Hisar</option>
              <option value="Hospet">Hospet</option>
              <option value="Howrah">Howrah</option>
              <option value="Hubli">Hubli</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Ichalkaranji">Ichalkaranji</option>
              <option value="Imphal">Imphal</option>
              <option value="Indore">Indore</option>
              <option value="Itanagar">Itanagar</option>
              <option value="Jabalpur">Jabalpur</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Jalgaon">Jalgaon</option>
              <option value="Jalna">Jalna</option>
              <option value="Jalandhar">Jalandhar</option>
              <option value="Jalpaiguri">Jalpaiguri</option>
              <option value="Jammu">Jammu</option>
              <option value="Jamnagar">Jamnagar</option>
              <option value="Jamshedpur">Jamshedpur</option>
              <option value="Jaunpur">Jaunpur</option>
              <option value="Jhansi">Jhansi</option>
              <option value="Jharsuguda">Jharsuguda</option>
              <option value="Jodhpur">Jodhpur</option>
              <option value="Jorhat">Jorhat</option>
              <option value="Junagadh">Junagadh</option>
              <option value="Kadapa">Kadapa</option>
              <option value="Kakinada">Kakinada</option>
              <option value="Kanchipuram">Kanchipuram</option>
              <option value="Kannur">Kannur</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Kapurthala">Kapurthala</option>
              <option value="Karaikal">Karaikal</option>
              <option value="Karauli">Karauli</option>
              <option value="Kargil">Kargil</option>
              <option value="Karimnagar">Karimnagar</option>
              <option value="Karnal">Karnal</option>
              <option value="Karur">Karur</option>
              <option value="Kasaragod">Kasaragod</option>
              <option value="Kathua">Kathua</option>
              <option value="Katihar">Katihar</option>
              <option value="Kavaratti">Kavaratti</option>
              <option value="Khammam">Khammam</option>
              <option value="Kharagpur">Kharagpur</option>
              <option value="Kishanganj">Kishanganj</option>
              <option value="Kochi">Kochi</option>
              <option value="Kohima">Kohima</option>
              <option value="Kolar">Kolar</option>
              <option value="Kolhapur">Kolhapur</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Kollam">Kollam</option>
              <option value="Koppal">Koppal</option>
              <option value="Kota">Kota</option>
              <option value="Kottayam">Kottayam</option>
              <option value="Kozhikode">Kozhikode</option>
              <option value="Kullu">Kullu</option>
              <option value="Kumbakonam">Kumbakonam</option>
              <option value="Kurnool">Kurnool</option>
              <option value="Latur">Latur</option>
              <option value="Leh">Leh</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Ludhiana">Ludhiana</option>
              <option value="Machilipatnam">Machilipatnam</option>
              <option value="Madurai">Madurai</option>
              <option value="Mahbubnagar">Mahbubnagar</option>
              <option value="Malappuram">Malappuram</option>
              <option value="Mandi">Mandi</option>
              <option value="Mandya">Mandya</option>
              <option value="Mangalore">Mangalore</option>
              <option value="Mangaluru">Mangaluru</option>
              <option value="Mathura">Mathura</option>
              <option value="Mau">Mau</option>
              <option value="Meerut">Meerut</option>
              <option value="Mehsana">Mehsana</option>
              <option value="Mira-Bhayandar">Mira-Bhayandar</option>
              <option value="Mirzapur">Mirzapur</option>
              <option value="Mohali">Mohali</option>
              <option value="Moga">Moga</option>
              <option value="Moradabad">Moradabad</option>
              <option value="Morena">Morena</option>
              <option value="Motihari">Motihari</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Munger">Munger</option>
              <option value="Murthal">Murthal</option>
              <option value="Muzaffarnagar">Muzaffarnagar</option>
              <option value="Muzaffarpur">Muzaffarpur</option>
              <option value="Mysore">Mysore</option>
              <option value="Nadiad">Nadiad</option>
              <option value="Nagaon">Nagaon</option>
              <option value="Nagapattinam">Nagapattinam</option>
              <option value="Nagaur">Nagaur</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nagercoil">Nagercoil</option>
              <option value="Nalgonda">Nalgonda</option>
              <option value="Namakkal">Namakkal</option>
              <option value="Nanded">Nanded</option>
              <option value="Nandyal">Nandyal</option>
              <option value="Nashik">Nashik</option>
              <option value="Nathdwara">Nathdwara</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
              <option value="Nellore">Nellore</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Nizamabad">Nizamabad</option>
              <option value="Noida">Noida</option>
              <option value="Ongole">Ongole</option>
              <option value="Ooty">Ooty</option>
              <option value="Orai">Orai</option>
              <option value="Osmanabad">Osmanabad</option>
              <option value="Palakkad">Palakkad</option>
              <option value="Palanpur">Palanpur</option>
              <option value="Palghar">Palghar</option>
              <option value="Pali">Pali</option>
              <option value="Panaji">Panaji</option>
              <option value="Panchkula">Panchkula</option>
              <option value="Panipat">Panipat</option>
              <option value="Parbhani">Parbhani</option>
              <option value="Patan">Patan</option>
              <option value="Pathankot">Pathankot</option>
              <option value="Patiala">Patiala</option>
              <option value="Patna">Patna</option>
              <option value="Phagwara">Phagwara</option>
              <option value="Pilibhit">Pilibhit</option>
              <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
              <option value="Pondicherry">Pondicherry</option>
              <option value="Porbandar">Porbandar</option>
              <option value="Port Blair">Port Blair</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Pune">Pune</option>
              <option value="Puri">Puri</option>
              <option value="Purnia">Purnia</option>
              <option value="Raebareli">Raebareli</option>
              <option value="Raichur">Raichur</option>
              <option value="Raigarh">Raigarh</option>
              <option value="Raipur">Raipur</option>
              <option value="Rajahmundry">Rajahmundry</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Rajnandgaon">Rajnandgaon</option>
              <option value="Rajouri">Rajouri</option>
              <option value="Ramgarh">Ramgarh</option>
              <option value="Rampur">Rampur</option>
              <option value="Ranchi">Ranchi</option>
              <option value="Ranipet">Ranipet</option>
              <option value="Ratlam">Ratlam</option>
              <option value="Ratnagiri">Ratnagiri</option>
              <option value="Rewa">Rewa</option>
              <option value="Rewari">Rewari</option>
              <option value="Rohtak">Rohtak</option>
              <option value="Roorkee">Roorkee</option>
              <option value="Rourkela">Rourkela</option>
              <option value="Sagar">Sagar</option>
              <option value="Saharanpur">Saharanpur</option>
              <option value="Salem">Salem</option>
              <option value="Samastipur">Samastipur</option>
              <option value="Sambalpur">Sambalpur</option>
              <option value="Sangli">Sangli</option>
              <option value="Sangrur">Sangrur</option>
              <option value="Satara">Satara</option>
              <option value="Satna">Satna</option>
              <option value="Sawai Madhopur">Sawai Madhopur</option>
              <option value="Secunderabad">Secunderabad</option>
              <option value="Shahjahanpur">Shahjahanpur</option>
              <option value="Shillong">Shillong</option>
              <option value="Shimla">Shimla</option>
              <option value="Shimoga">Shimoga</option>
              <option value="Silchar">Silchar</option>
              <option value="Siliguri">Siliguri</option>
              <option value="Silvassa">Silvassa</option>
              <option value="Sindri">Sindri</option>
              <option value="Singrauli">Singrauli</option>
              <option value="Sitapur">Sitapur</option>
              <option value="Siwan">Siwan</option>
              <option value="Solapur">Solapur</option>
              <option value="Sonipat">Sonipat</option>
              <option value="Srikakulam">Srikakulam</option>
              <option value="Srinagar">Srinagar</option>
              <option value="Sultanpur">Sultanpur</option>
              <option value="Surat">Surat</option>
              <option value="Surendranagar">Surendranagar</option>
              <option value="Tadepalligudem">Tadepalligudem</option>
              <option value="Tenali">Tenali</option>
              <option value="Thane">Thane</option>
              <option value="Thanjavur">Thanjavur</option>
              <option value="Thiruvananthapuram">Thiruvananthapuram</option>
              <option value="Thoothukudi">Thoothukudi</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Tinsukia">Tinsukia</option>
              <option value="Tiruchirappalli">Tiruchirappalli</option>
              <option value="Tirunelveli">Tirunelveli</option>
              <option value="Tirupati">Tirupati</option>
              <option value="Tirupur">Tirupur</option>
              <option value="Tiruvannamalai">Tiruvannamalai</option>
              <option value="Tumkur">Tumkur</option>
              <option value="Udaipur">Udaipur</option>
              <option value="Udgir">Udgir</option>
              <option value="Udupi">Udupi</option>
              <option value="Ujjain">Ujjain</option>
              <option value="Ulhasnagar">Ulhasnagar</option>
              <option value="Unnao">Unnao</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Valsad">Valsad</option>
              <option value="Vapi">Vapi</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Vellore">Vellore</option>
              <option value="Veraval">Veraval</option>
              <option value="Vidisha">Vidisha</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
              <option value="Vizianagaram">Vizianagaram</option>
              <option value="Warangal">Warangal</option>
              <option value="Wardha">Wardha</option>
              <option value="Yamunanagar">Yamunanagar</option>
              <option value="Yavatmal">Yavatmal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              🗺️ Google Maps link * <span className="text-olive-light font-normal">(paste link — area auto-detected)</span>
            </label>
            <input type="url" value={foodData.google_maps_link} onChange={(e) => {
              const link = e.target.value;
              setFoodData({
                ...foodData,
                google_maps_link: link,
                area: extractAreaFromLink(link) || foodData.area,
              });
            }} placeholder="https://maps.app.goo.gl/..." className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">📍 Area / Neighborhood <span className="text-olive-light font-normal">(auto-filled from link, editable)</span></label>
            <div className="relative">
              <input type="text" value={foodData.area} onChange={(e) => setFoodData({ ...foodData, area: e.target.value })} placeholder="Auto-detected from Google Maps link" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" list="area-list" />
              <datalist id="area-list">
                <option value="HSR Layout" /><option value="BTM Layout" /><option value="Koramangala" /><option value="Indiranagar" /><option value="Jayanagar" /><option value="JP Nagar" /><option value="Whitefield" /><option value="Marathahalli" /><option value="Electronic City" /><option value="Banashankari" /><option value="MG Road" /><option value="Brigade Road" /><option value="Church Street" /><option value="Commercial Street" /><option value="Lavelle Road" /><option value="Residency Road" /><option value="Basavanagudi" /><option value="Malleshwaram" /><option value="Rajajinagar" /><option value="Yelahanka" /><option value="Hebbal" /><option value="Kalyan Nagar" /><option value="HAL" /><option value="Sarjapur Road" /><option value="Bellandur" /><option value="Hennur" /><option value="Kamanahalli" /><option value="RT Nagar" /><option value="Seshadripuram" /><option value="Ulsoor" /><option value="Cooke Town" /><option value="Sadashivanagar" /><option value="Cunningham Road" /><option value="Vasanth Nagar" /><option value="Domlur" /><option value="Jakkur" /><option value="Kengeri" /><option value="Vijayanagar" /><option value="Rajajinagar" /><option value="Chamrajpet" /><option value="Mysore City" /><option value="Kuvempunagar" /><option value="Vijayanagar (Mysore)" /><option value="Gokulam" /><option value="JayaLakshmipuram" /><option value="Hebbal (Mysore)" />
              </datalist>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-olive-light font-normal">(optional)</span></label>
            <textarea value={foodData.description} onChange={(e) => setFoodData({ ...foodData, description: e.target.value })} placeholder="What makes this place special?" rows={3} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary resize-none" />
          </div>
          <PhotoUpload onFileSelect={setFoodPhoto} />
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setStep('choose-type'); setType(null); }} className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
            <button onClick={() => { setSelectedItem({ type: 'food', title: foodData.title, creator: foodData.cuisine || foodData.creator, must_try: foodData.must_try || null, notes: foodData.notes || null, description: foodData.description, city: foodData.city }); setStep('confirm'); }} disabled={!foodData.title || !foodData.cuisine || !foodData.city || !foodData.google_maps_link} className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark disabled:opacity-50 disabled:cursor-not-allowed">Preview & Add</button>
        </div>
          </div>
      )}

      {step === 'confirm' && selectedItem && (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-white border border-stone-200">
            {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.title || ''} className="w-20 h-28 object-cover rounded-lg shrink-0 bg-stone-100" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-800">{selectedItem.title}</h3>
              {selectedItem.creator && <p className="text-sm text-olive mt-0.5">{selectedItem.creator}</p>}
              {selectedItem.external_rating && <p className="text-xs font-bold text-amber-primary bg-amber-primary/10 inline-block px-2 py-0.5 rounded-full mt-1">⭐ {selectedItem.external_rating.toFixed(1)}</p>}
              {type === 'movie' && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-stone-500 block mb-1">What mood fits this movie?</label>
                  <select
                    value={selectedItem.mood || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, mood: e.target.value || null })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
                  >
                    <option value="">No specific mood</option>
                    <option value="Feel Good">Feel Good</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Dark">Dark</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Thought-Provoking">Thought-Provoking</option>
                    <option value="Funny">Funny</option>
                    <option value="Scary">Scary</option>
                    <option value="Inspiring">Inspiring</option>
                    <option value="Action-packed">Action-packed</option>
                    <option value="Mind-bending">Mind-bending</option>
                    <option value="Heartwarming">Heartwarming</option>
                    <option value="Suspenseful">Suspenseful</option>
                  </select>
                </div>
              )}
              {selectedItem.description && <p className="text-xs text-olive-light mt-2 line-clamp-3">{selectedItem.description}</p>}
            </div>
          </div>
          {type === 'book' && (
            <div className="space-y-3">
              {/* Author — always required */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Author *</label>
                <input
                  type="text"
                  value={selectedItem.creator || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, creator: e.target.value || null })}
                  placeholder="Author name"
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
                  required
                />
                {!selectedItem.creator && (
                  <p className="text-xs text-red-500 mt-1">Author is required</p>
                )}
              </div>
              {/* Genre — always required */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Genre *</label>
                <select
                  value={selectedItem.genre || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, genre: e.target.value || null })}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary appearance-none"
                  required
                >
                  <option value="">Select genre...</option>
                  <option value="Classic Literature">Classic Literature</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Horror">Horror</option>
                  <option value="Biography">Biography</option>
                  <option value="Memoir">Memoir</option>
                  <option value="History">History</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Business">Business</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Drama">Drama</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Children">Children</option>
                  <option value="Graphic Novel">Graphic Novel</option>
                  <option value="Travel">Travel</option>
                  <option value="Literary Fiction">Literary Fiction</option>
                </select>
              </div>
              {/* Purchase link — optional */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Purchase link <span className="text-olive-light font-normal">(Amazon / Flipkart — optional)</span></label>
                <input type="url" value={purchaseLink} onChange={(e) => setPurchaseLink(e.target.value)} placeholder="https://www.amazon.in/..." className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary" />
              </div>
            </div>
          )}
          {submitError && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"><AlertCircle size={16} className="inline mr-1" />{submitError}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep(type === 'food' ? 'detail' : 'search')} className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={isSubmitting || (type === 'book' && (!selectedItem.creator || !selectedItem.genre))} className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : 'Add to The List'}
            </button>
          </div>

          {type === 'food' && <p className="text-[11px] text-olive-light text-center">Cuisine emoji + gradient shown if no photo.</p>}
        </div>
      )}
    </div>
  );
}
