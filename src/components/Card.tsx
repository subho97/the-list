import Link from 'next/link';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, MapPin } from 'lucide-react';
import RatingBadge from './RatingBadge';
import VoteButtons from './VoteButtons';
import { thumbnailUrl } from '@/lib/images';

interface CardProps {
  item: Item;
  index?: number;
}

const typeIcons = {
  movie: Film,
  book: BookOpen,
  food: UtensilsCrossed,
};

const typeLabels = {
  movie: 'Movie',
  book: 'Book',
  food: 'Food',
};

const typeBadgeGradients = {
  movie: 'bg-gradient-to-r from-blue-500 to-blue-600',
  book: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  food: 'bg-gradient-to-r from-orange-500 to-orange-600',
};

const cuisineEmojis: Record<string, string> = {
  pizza: '🍕', italian: '🍝', pasta: '🍝',
  sushi: '🍣', japanese: '🍜',
  dimsum: '🥟', dumpling: '🥟', gyoza: '🥟', momo: '🥟', 'pan asian': '🍜',
  bakery: '🥐', cake: '🍰', dessert: '🍨', sweet: '🍯',
  coffee: '☕', cafe: '☕', brunch: '🥞', tea: '🫖',
  burger: '🍔',
  steak: '🥩', grill: '🥩', meat: '🍖',
  indian: '🍛', curry: '🍛', litti: '🫓', paratha: '🫓', naan: '🫓',
  mediterranean: '🥙', shawarma: '🥙', kebab: '🥙',
  ramen: '🍜', noodle: '🍜',
  mexican: '🌮', taco: '🌮',
  thai: '🍜', vietnamese: '🍜',
  egyptian: '🧆', 'middle eastern': '🧆',
  street: '🌮', 'food truck': '🌮',
  'pani puri': '🫧', chaat: '🫧',
};

const cuisineGradients: Record<string, string> = {
  pizza: 'from-amber-200/60 to-amber-300/30',
  italian: 'from-amber-200/60 to-amber-300/30',
  pasta: 'from-amber-200/60 to-amber-300/30',
  sushi: 'from-emerald-200/60 to-emerald-300/30',
  japanese: 'from-emerald-200/60 to-emerald-300/30',
  dimsum: 'from-pink-200/60 to-pink-300/30',
  dumpling: 'from-pink-200/60 to-pink-300/30',
  momo: 'from-pink-200/60 to-pink-300/30',
  bakery: 'from-orange-200/60 to-orange-300/30',
  coffee: 'from-yellow-200/60 to-yellow-300/30',
  cafe: 'from-yellow-200/60 to-yellow-300/30',
  burger: 'from-red-200/60 to-red-300/30',
  steak: 'from-red-200/60 to-red-300/30',
  indian: 'from-orange-300/60 to-orange-400/30',
  curry: 'from-orange-300/60 to-orange-400/30',
  mediterranean: 'from-green-200/60 to-green-300/30',
  shawarma: 'from-green-200/60 to-green-300/30',
  ramen: 'from-red-200/60 to-red-300/30',
  noodle: 'from-red-200/60 to-red-300/30',
  mexican: 'from-lime-200/60 to-lime-300/30',
  thai: 'from-teal-200/60 to-teal-300/30',
  egyptian: 'from-purple-200/60 to-purple-300/30',
  street: 'from-orange-200/60 to-orange-300/30',
};

function getCuisineKey(cuisine: string | null): string {
  if (!cuisine) return 'default';
  const c = cuisine.toLowerCase();
  for (const key of Object.keys(cuisineEmojis)) {
    if (c.includes(key)) return key;
  }
  return 'default';
}

function getCuisineEmoji(cuisine: string | null): string {
  const key = getCuisineKey(cuisine);
  return cuisineEmojis[key] || '🍽️';
}

function getCuisineGradient(cuisine: string | null): string {
  const key = getCuisineKey(cuisine);
  return cuisineGradients[key] || 'from-stone-200/60 to-stone-300/30';
}

export default function Card({ item, index = 99 }: CardProps) {
  const Icon = typeIcons[item.type];

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-150 overflow-hidden border border-stone-200 hover:border-amber-primary/30 hover:-translate-y-0.5 h-full"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={thumbnailUrl(item.image_url) || item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={index < 10 ? 'eager' : 'lazy'}
            decoding={index < 10 ? 'sync' : 'async'}
            fetchPriority={index < 6 ? 'high' : 'auto'}
            crossOrigin="anonymous"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : item.type === 'food' ? (
          <div className={`w-full h-full bg-gradient-to-br ${getCuisineGradient(item.cuisine)} flex flex-col items-center justify-center`}>
            <span className="text-5xl md:text-6xl mb-2">{getCuisineEmoji(item.cuisine)}</span>
            <p className="text-[11px] text-olive-light font-medium uppercase tracking-wider">{item.cuisine || 'Food'}</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive-light">
            <Icon size={48} strokeWidth={1} />
          </div>
        )}
        {/* Rating badge overlay — top-right (movies only, not books) */}
        {item.type !== 'book' && (
          <div className="absolute top-2 right-2 z-10">
            <RatingBadge rating={item.external_rating} />
          </div>
        )}
        {/* Type badge — top-left with gradient */}
        <div className={`absolute top-2 left-2 ${typeBadgeGradients[item.type]} rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm`}>
          {typeLabels[item.type]}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-0.5">
        <h3 className="font-medium text-stone-900 text-sm line-clamp-2 group-hover:text-amber-primary transition-colors duration-150 leading-snug">
          {item.title}
        </h3>
        {item.creator && item.type !== 'food' && (
          <p className="text-[12px] text-olive truncate">{item.creator}</p>
        )}
        {item.genre && !item.cuisine && (
          <p className="text-[12px] text-olive-light truncate">{item.genre}</p>
        )}
        {item.cuisine && (
          <p className="text-[12px] text-olive-light truncate">{item.cuisine}</p>
        )}
        {item.year && (
          <p className="text-[12px] text-olive-light">{item.year}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          {(item.area || item.city) && (
            <p className="text-[12px] text-olive-light flex items-center gap-1">
              <MapPin size={10} />
              {item.area || item.city}
            </p>
          )}
          <div className="ml-auto">
            <VoteButtons itemId={item.id} initialUpvotes={item.upvotes} initialDownvotes={item.downvotes} />
          </div>
        </div>
      </div>
    </Link>
  );
}
