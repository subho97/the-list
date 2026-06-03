'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Film, BookOpen, UtensilsCrossed, Search, X, AlertCircle, Loader2 } from 'lucide-react';
import { ItemType, MovieSearchResult, BookSearchResult, Item } from '@/lib/types';
import PhotoUpload from './PhotoUpload';

type Step = 'choose-type' | 'search' | 'detail' | 'confirm';
type AddType = ItemType | null;

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToList?: (itemId: string) => void;
}

export default function AddItemModal({ isOpen, onClose, onAddToList }: AddItemModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('choose-type');
  const [type, setType] = useState<AddType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(MovieSearchResult | BookSearchResult)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedItem, setSelectedItem] = useState<Partial<Item> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [foodData, setFoodData] = useState({
    title: '',
    cuisine: '',
    must_try: '',
    notes: '',
    city: '',
    google_maps_link: '',
    description: '',
    year: new Date().getFullYear(),
    image_url: '',
  });

  // Search timeout ref for debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleTypeSelect = (selectedType: AddType) => {
    setType(selectedType);
    if (selectedType === 'food') {
      setStep('detail');
    } else {
      setStep('search');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    try {
      if (type === 'movie') {
        const res = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data.results || []);
      } else if (type === 'book') {
        const res = await fetch(`/api/items/search-books?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch {
      setSearchError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMovieSelect = async (result: MovieSearchResult) => {
    const rating = parseFloat(result.imdbRating);
    setSelectedItem({
      type: 'movie',
      title: result.Title,
      creator: result.Director || 'Unknown',
      year: parseInt(result.Year),
      description: result.Plot,
      image_url: result.Poster !== 'N/A' ? result.Poster : null,
      external_rating: isNaN(rating) ? null : rating,
      imdb_id: result.imdbID,
      genre: result.Genre ? result.Genre.split(',')[0].trim() : null,
      mood: null,
      external_link: `https://www.imdb.com/title/${result.imdbID}`,
    });
    setStep('confirm');
  };

  const handleBookSelect = async (result: BookSearchResult) => {
    setSelectedItem({
      type: 'book',
      title: result.volumeInfo.title,
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
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let imageUrl = selectedItem?.image_url || null;

      // Upload food photo if applicable
      if (type === 'food' && foodPhoto) {
        const formData = new FormData();
        formData.append('file', foodPhoto);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      // For food, use manual data
      const itemData = type === 'food'
        ? {
            type: 'food',
            title: foodData.title,
            cuisine: foodData.cuisine || null,
            must_try: foodData.must_try || null,
            notes: foodData.notes || null,
            city: foodData.city || null,
            google_maps_link: foodData.google_maps_link || null,
            description: foodData.description,
            image_url: imageUrl,
            added_by: 'Anonymous',
          }
        : {
            ...selectedItem,
            image_url: imageUrl,
            added_by: 'Anonymous',
          };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add item');
      }

      const newItem = await res.json();
      if (onAddToList) {
        onAddToList(newItem.id);
      }
      router.refresh();
      resetAndClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('choose-type');
    setType(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSelectedItem(null);
    setFoodPhoto(null);
    setFoodData({ title: '', cuisine: '', must_try: '', notes: '', description: '', city: '', google_maps_link: '', year: new Date().getFullYear(), image_url: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {step === 'choose-type' && "What's good?"}
            {step === 'search' && `Search ${type === 'movie' ? 'Movies' : 'Books'}`}
            {step === 'detail' && 'Add Food Place'}
            {step === 'confirm' && 'Confirm'}
          </h2>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-olive-light transition-colors duration-150"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step: Choose Type */}
        {step === 'choose-type' && (
          <div className="p-5 space-y-3">
            <button
              onClick={() => handleTypeSelect('movie')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-amber-primary/40 hover:bg-amber-primary/5 transition-all duration-150 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Film size={22} />
              </div>
              <div>
                <p className="font-medium text-stone-900">Movie</p>
                <p className="text-sm text-olive-light">Search OMDb to find any movie</p>
              </div>
            </button>
            <button
              onClick={() => handleTypeSelect('book')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-amber-primary/40 hover:bg-amber-primary/5 transition-all duration-150 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="font-medium text-stone-900">Book</p>
                <p className="text-sm text-olive-light">Search Google Books</p>
              </div>
            </button>
            <button
              onClick={() => handleTypeSelect('food')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-amber-primary/40 hover:bg-amber-primary/5 transition-all duration-150 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                <UtensilsCrossed size={22} />
              </div>
              <div>
                <p className="font-medium text-stone-900">Food Place</p>
                <p className="text-sm text-olive-light">Manual entry — add reviews later</p>
              </div>
            </button>
          </div>
        )}

        {/* Step: Search */}
        {step === 'search' && (
          <div className="p-5 space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  searchTimeoutRef.current = setTimeout(() => handleSearch(e.target.value), 400);
                  setSearchQuery(e.target.value);
                }}
                placeholder={`Search ${type === 'movie' ? 'movies' : 'books'}...`}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
                autoFocus
              />
            </div>

            {searchError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{searchError}</p>
              </div>
            )}

            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-amber-primary" />
              </div>
            )}

            {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && !searchError && (
              <p className="text-center text-sm text-olive-light py-8">
                No results found. Try a different search.
              </p>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((result) => {
                if (type === 'movie') {
                  const movieResult = result as MovieSearchResult;
                  return (
                    <button
                      key={movieResult.imdbID}
                      onClick={() => handleMovieSelect(movieResult)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all duration-150 text-left"
                    >
                      <img
                        src={movieResult.Poster !== 'N/A' ? movieResult.Poster : '/placeholder.svg'}
                        alt={movieResult.Title}
                        className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 text-sm truncate">{movieResult.Title}</p>
                        <p className="text-xs text-olive">{movieResult.Year}</p>
                      </div>
                      {movieResult.imdbRating && (
                        <span className="text-xs font-bold text-amber-primary bg-amber-primary/10 px-2 py-1 rounded-full shrink-0">
                          {movieResult.imdbRating}
                        </span>
                      )}
                    </button>
                  );
                }
                const bookResult = result as BookSearchResult;
                return (
                  <button
                    key={bookResult.id}
                    onClick={() => handleBookSelect(bookResult)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all duration-150 text-left"
                  >
                    <img
                      src={bookResult.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '/placeholder.svg'}
                      alt={bookResult.volumeInfo.title}
                      className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm truncate">{bookResult.volumeInfo.title}</p>
                      <p className="text-xs text-olive">{bookResult.volumeInfo.authors?.join(', ') || 'Unknown author'}</p>
                    </div>
                    {bookResult.volumeInfo.averageRating && (
                      <span className="text-xs font-bold text-amber-primary bg-amber-primary/10 px-2 py-1 rounded-full shrink-0">
                        {bookResult.volumeInfo.averageRating}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Detail (Food manual entry) */}
        {step === 'detail' && type === 'food' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
              <input
                type="text"
                value={foodData.title}
                onChange={(e) => setFoodData({ ...foodData, title: e.target.value })}
                placeholder="Restaurant or place name"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Cuisine / Category</label>
              <input
                type="text"
                value={foodData.cuisine}
                onChange={(e) => setFoodData({ ...foodData, cuisine: e.target.value })}
                placeholder="e.g. Indian, Italian, Cafe"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
                list="modal-cuisine-list"
              />
              <datalist id="modal-cuisine-list">
                <option value="BBQ" /><option value="Bakery" /><option value="Biryani" /><option value="Breakfast" /><option value="Brunch" /><option value="Burgers" /><option value="Cafe" /><option value="Chinese" /><option value="Dessert" /><option value="Dimsum" /><option value="Food Truck" /><option value="French" /><option value="Grill" /><option value="Ice Cream" /><option value="Italian" /><option value="Japanese" /><option value="Kebab" /><option value="Korean" /><option value="Mediterranean" /><option value="Mexican" /><option value="Middle Eastern" /><option value="Momos" /><option value="Noodles" /><option value="North Indian" /><option value="Pan Asian" /><option value="Pizza" /><option value="Ramen" /><option value="Shawarma" /><option value="South Indian" /><option value="Steak" /><option value="Street Food" /><option value="Sushi" /><option value="Thai" /><option value="Vegan" /><option value="Vietnamese" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">✨ Must try</label>
              <input
                type="text"
                value={foodData.must_try}
                onChange={(e) => setFoodData({ ...foodData, must_try: e.target.value })}
                placeholder="e.g. Butter Chicken, Sushi Platter"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">📝 Notes</label>
              <input
                type="text"
                value={foodData.notes}
                onChange={(e) => setFoodData({ ...foodData, notes: e.target.value })}
                placeholder="Timings, hints, etc."
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={foodData.city}
                onChange={(e) => setFoodData({ ...foodData, city: e.target.value })}
                placeholder="e.g. Bangalore"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">🗺️ Google Maps link</label>
              <input
                type="url"
                value={foodData.google_maps_link}
                onChange={(e) => setFoodData({ ...foodData, google_maps_link: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                value={foodData.description}
                onChange={(e) => setFoodData({ ...foodData, description: e.target.value })}
                placeholder="What makes this place special?"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150 resize-none"
              />
            </div>
            <PhotoUpload onFileSelect={setFoodPhoto} />
            <button
              onClick={() => {
                setSelectedItem({
                  type: 'food',
                  title: foodData.title,
                  cuisine: foodData.cuisine,
                  description: foodData.description,
                  image_url: null,
                });
                setStep('confirm');
              }}
              disabled={!foodData.title}
              className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedItem && (
          <div className="p-5 space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-white border border-stone-200">
              {selectedItem.image_url && (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title || ''}
                  className="w-20 h-28 object-cover rounded-lg shrink-0"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-900">{selectedItem.title}</h3>
                {selectedItem.creator && (
                  <p className="text-sm text-olive mt-0.5">{selectedItem.creator}</p>
                )}
                {selectedItem.type === 'movie' && (
                  <div className="mt-2">
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
                {selectedItem.external_rating && (
                  <p className="text-xs font-bold text-amber-primary bg-amber-primary/10 inline-block px-2 py-0.5 rounded-full mt-2">
                    Rating: {selectedItem.external_rating.toFixed(1)}
                  </p>
                )}
                {selectedItem.description && (
                  <p className="text-xs text-olive-light mt-1 line-clamp-2">{selectedItem.description}</p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(type === 'food' ? 'detail' : 'search')}
                className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors duration-150"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : 'Add to The List'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
