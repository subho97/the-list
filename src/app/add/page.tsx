'use client';

import { useState } from 'react';
import { Film, BookOpen, UtensilsCrossed, Search, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const [foodData, setFoodData] = useState({
    title: '',
    creator: '',
    description: '',
    year: new Date().getFullYear(),
  });

  let searchTimeout: ReturnType<typeof setTimeout>;

  const handleTypeSelect = (selectedType: ItemType) => {
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

  const handleMovieSelect = (result: MovieSearchResult) => {
    const rating = parseFloat(result.imdbRating);
    if (rating < 7.0) {
      setSearchError(`"${result.Title}" has a ${rating} IMDB rating — it doesn't meet The List's quality bar of 7.0+.`);
      return;
    }
    setSelectedItem({
      type: 'movie',
      title: result.Title,
      creator: result.Director || 'Unknown',
      year: parseInt(result.Year),
      description: result.Plot || null,
      image_url: result.Poster !== 'N/A' ? result.Poster : null,
      external_rating: rating,
      imdb_id: result.imdbID,
      external_link: `https://www.imdb.com/title/${result.imdbID}`,
    });
    setStep('confirm');
  };

  const handleBookSelect = (result: BookSearchResult) => {
    setSelectedItem({
      type: 'book',
      title: result.volumeInfo.title,
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
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let imageUrl = selectedItem?.image_url || null;

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

      const itemData = type === 'food'
        ? { type: 'food', title: foodData.title, creator: foodData.creator, year: foodData.year, description: foodData.description, image_url: imageUrl, added_by: 'Anonymous' }
        : { ...selectedItem, image_url: imageUrl, added_by: 'Anonymous' };

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
      setAddedItemId(newItem.id);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('choose-type');
    setType(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSelectedItem(null);
    setFoodPhoto(null);
    setFoodData({ title: '', creator: '', description: '', year: new Date().getFullYear() });
    setAddedItemId(null);
  };

  if (addedItemId) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <Check size={36} className="text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Added to The List!</h2>
          <p className="text-olive text-sm mb-6">Your item is now part of the collection.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/items/${addedItemId}`)}
              className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
            >
              View item
            </button>
            <button
              onClick={resetForm}
              className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors duration-150"
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 px-4 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">Add to The List</h1>
      <p className="text-olive text-sm mb-8">Share something good with the world.</p>

      {/* Step: Choose Type */}
      {step === 'choose-type' && (
        <div className="space-y-3">
          {(Object.entries(typeConfig) as [ItemType, typeof typeConfig.movie][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => handleTypeSelect(key)}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-200 hover:border-amber-primary/40 hover:bg-amber-primary/5 transition-all duration-150 text-left group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-150`}>
                  <Icon size={26} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{config.label}</p>
                  <p className="text-sm text-olive-light mt-0.5">
                    {key === 'movie' ? 'Search OMDb — only 7.0+ IMDB rated' :
                     key === 'book' ? 'Search Google Books' :
                     'Manual entry with photo'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step: Search (Movies & Books) */}
      {step === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (searchTimeout) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => handleSearch(e.target.value), 400);
                setSearchQuery(e.target.value);
              }}
              placeholder={`Search ${type === 'movie' ? 'movies' : 'books'}...`}
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              autoFocus
            />
          </div>

          {searchError && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{searchError}</p>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-amber-primary" />
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && !searchError && (
            <p className="text-center text-sm text-olive-light py-12">
              No {type === 'movie' ? 'movies' : 'books'} found. Try a different search.
            </p>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {searchResults.map((result) => {
              if (type === 'movie') {
                const movieResult = result as MovieSearchResult;
                const rating = parseFloat(movieResult.imdbRating);
                const isQualified = !isNaN(rating) && rating >= 8.0;
                return (
                  <button
                    key={movieResult.imdbID}
                    onClick={() => isQualified && handleMovieSelect(movieResult)}
                    disabled={!isQualified}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                      isQualified
                        ? 'border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 cursor-pointer'
                        : 'border-red-100 bg-red-50/30 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <img
                      src={movieResult.Poster !== 'N/A' ? movieResult.Poster : '/placeholder.svg'}
                      alt={movieResult.Title}
                      className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-stone-900 text-sm truncate">{movieResult.Title}</p>
                      <p className="text-xs text-olive">{movieResult.Year}</p>
                      {!isQualified && (
                        <p className="text-xs text-red-500 mt-0.5">Below 8.0 quality bar ({movieResult.imdbRating})</p>
                      )}
                    </div>
                    {movieResult.imdbRating && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                        isQualified ? 'bg-amber-primary/10 text-amber-primary' : 'bg-red-100 text-red-500'
                      }`}>
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
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-stone-900 text-sm truncate">{bookResult.volumeInfo.title}</p>
                    <p className="text-xs text-olive truncate">{bookResult.volumeInfo.authors?.join(', ') || 'Unknown author'}</p>
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

          <button
            onClick={() => { setStep('choose-type'); setSearchQuery(''); setSearchResults([]); setSearchError(''); }}
            className="text-sm text-olive hover:text-stone-700 transition-colors duration-150"
          >
            ← Choose a different type
          </button>
        </div>
      )}

      {/* Step: Detail (Food) */}
      {step === 'detail' && type === 'food' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Restaurant Name *</label>
            <input
              type="text"
              value={foodData.title}
              onChange={(e) => setFoodData({ ...foodData, title: e.target.value })}
              placeholder="e.g. The Bombay Canteen"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Cuisine / Location</label>
            <input
              type="text"
              value={foodData.creator}
              onChange={(e) => setFoodData({ ...foodData, creator: e.target.value })}
              placeholder="e.g. Indian, Mumbai"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={foodData.description}
              onChange={(e) => setFoodData({ ...foodData, description: e.target.value })}
              placeholder="What makes this place special?"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150 resize-none"
            />
          </div>
          <PhotoUpload onFileSelect={setFoodPhoto} />

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setStep('choose-type'); setType(null); }}
              className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors duration-150"
            >
              Back
            </button>
            <button
              onClick={() => {
                setSelectedItem({
                  type: 'food',
                  title: foodData.title,
                  creator: foodData.creator,
                  description: foodData.description,
                });
                setStep('confirm');
              }}
              disabled={!foodData.title}
              className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview & Add
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && selectedItem && (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-white border border-stone-200">
            {selectedItem.image_url && (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title || ''}
                className="w-20 h-28 object-cover rounded-lg shrink-0 bg-stone-100"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900">{selectedItem.title}</h3>
              {selectedItem.creator && <p className="text-sm text-olive mt-0.5">{selectedItem.creator}</p>}
              {selectedItem.external_rating && (
                <p className="text-xs font-bold text-amber-primary bg-amber-primary/10 inline-block px-2 py-0.5 rounded-full mt-1">
                  Rating: {selectedItem.external_rating.toFixed(1)}
                </p>
              )}
              {selectedItem.description && (
                <p className="text-xs text-olive-light mt-2 line-clamp-3 leading-relaxed">{selectedItem.description}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
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
                <><Loader2 size={16} className="animate-spin" /> Adding...</>
              ) : 'Add to The List'}
            </button>
          </div>

          {type === 'movie' && (
            <p className="text-xs text-olive-light text-center">
              Only movies with 7.0+ IMDB rating are accepted.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
