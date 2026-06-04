import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Item, Review } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, ExternalLink, Star, Share2, MapPin } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';
import ItemActions from './ItemActions';
import VoteButtons from '@/components/VoteButtons';
import BackButton from '@/components/BackButton';

interface ItemDetailData extends Item {
  reviews: Review[];
}

async function getItem(id: string): Promise<ItemDetailData | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: item } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (!item) return null;

    let reviews: Review[] = [];
    if (item.type === 'food') {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', id)
        .order('created_at', { ascending: false });
      reviews = reviewsData || [];
    }

    return { ...item, reviews };
  } catch {
    return null;
  }
}

const typeIcons = {
  movie: Film,
  book: BookOpen,
  food: UtensilsCrossed,
};

const typeLabels = {
  movie: 'Movie',
  book: 'Book',
  food: 'Food Place',
};

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const TypeIcon = typeIcons[item.type];

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-3xl mx-auto">
      {/* Back link — returns to previous page, falls back to browse */}
      <BackButton fallbackHref={`/browse?type=${item.type}`} label={item.type === 'movie' ? 'Movies' : item.type === 'book' ? 'Books' : 'Food'} />

      {/* Hero section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {item.type === 'food' ? (
          /* Food: compact, clean header — no giant poster box */
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-5">
              {/* Cuisine emoji icon */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-orange-200/60 to-orange-300/30 flex items-center justify-center text-3xl shadow-sm">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  '🍽️'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                    Food
                  </span>
                  {item.cuisine && (
                    <span className="text-[11px] text-olive-light bg-stone-100 px-2 py-0.5 rounded-full">
                      {item.cuisine}
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">{item.title}</h1>
                {(item.area || item.city) && (
                  <p className="text-sm text-olive-light flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {item.area || item.city}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {item.must_try && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">✨ Must Try</p>
                  <p className="text-sm text-stone-800 font-medium">{item.must_try}</p>
                </div>
              )}
              {item.notes && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-1">📝 Note</p>
                  <p className="text-sm text-stone-600">{item.notes}</p>
                </div>
              )}
              {item.google_maps_link && (
                <a href={item.google_maps_link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors duration-150">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">🗺️ Location</p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">Open in Google Maps <ExternalLink size={12} /></p>
                </a>
              )}
              {item.description && (
                <div className="p-4 bg-white rounded-xl border border-stone-100">
                  <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-1">📖 About</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <VoteButtons itemId={item.id} initialUpvotes={item.upvotes} initialDownvotes={item.downvotes} size="md" />
              {item.external_rating && (
                <RatingBadge rating={item.external_rating} size="md" />
              )}
            </div>

            <div className="mt-5">
              <ItemActions itemId={item.id} itemType={item.type} />
            </div>
          </div>
        ) : (
          /* Movie / Book: poster + info layout (unchanged) */
          <div className="md:flex">
            {/* Poster */}
            <div className="md:w-80 shrink-0">
              <div className="aspect-[3/4] bg-stone-100 relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-olive-light">
                    <TypeIcon size={80} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-stone-600 flex items-center gap-1.5">
                    <TypeIcon size={12} />
                    {typeLabels[item.type]}
                  </span>
                </div>
                {item.type !== 'book' && (
                  <div className="absolute top-3 right-3">
                    <RatingBadge rating={item.external_rating} size="md" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">{item.title}</h1>
                {item.creator && (
                  <p className="text-olive mt-1">
                    {item.type === 'movie' ? 'Directed by ' : 'By '}
                    {item.creator}
                  </p>
                )}
                {item.year && <p className="text-sm text-olive-light mt-1">{item.year}</p>}
                {item.genre && <p className="text-sm text-olive-light mt-1">{item.genre}</p>}

                {item.external_rating && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                      {item.type === 'movie' ? 'IMDB' : 'Rating'}:
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-amber-primary fill-amber-primary" />
                      <span className="font-bold text-stone-900">{item.external_rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {item.external_link && (
                  <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="mt-3 block p-3 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors duration-150">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-0.5">📖 About this {item.type}</p>
                    <p className="text-sm text-purple-600 flex items-center gap-1">{item.type === 'movie' ? 'View on IMDB' : 'View on Google Books'} <ExternalLink size={12} /></p>
                  </a>
                )}

                {item.purchase_link && (
                  <a href={item.purchase_link} target="_blank" rel="noopener noreferrer" className="mt-3 block p-3 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors duration-150">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">🛒 Buy this book</p>
                    <p className="text-sm text-emerald-600">Amazon / Flipkart <ExternalLink size={12} className="inline" /></p>
                  </a>
                )}

                {item.description && (
                  <p className="text-sm text-stone-600 mt-4 leading-relaxed">{item.description}</p>
                )}
              </div>

              <div className="mt-4">
                <VoteButtons itemId={item.id} initialUpvotes={item.upvotes} initialDownvotes={item.downvotes} size="md" />
              </div>

              <div className="mt-4">
                <ItemActions itemId={item.id} itemType={item.type} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Food Reviews */}
      {item.type === 'food' && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Reviews ({item.reviews.length})
            </h2>
            <Link
              href={`/items/${item.id}/review`}
              className="px-4 py-2.5 bg-amber-primary text-white rounded-xl text-sm font-medium hover:bg-amber-dark transition-colors duration-150 shadow-sm"
            >
              Add Review
            </Link>
          </div>

          {item.reviews.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-stone-200">
              <p className="text-olive-text-sm">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {item.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl p-5 border border-stone-200 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'text-amber-primary fill-amber-primary' : 'text-stone-200'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-olive-light">{review.reviewed_by}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
                  )}
                  {review.photo_url && (
                    <img
                      src={review.photo_url}
                      alt="Review photo"
                      className="w-full max-w-sm rounded-lg object-cover max-h-64 border border-stone-200"
                      loading="lazy"
                    />
                  )}
                  <p className="text-xs text-olive-light">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
