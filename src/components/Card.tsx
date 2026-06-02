import Link from 'next/link';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed, MapPin, Star } from 'lucide-react';
import RatingBadge from './RatingBadge';

interface CardProps {
  item: Item;
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

export default function Card({ item }: CardProps) {
  const Icon = typeIcons[item.type];

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-150 overflow-hidden border border-stone-200 hover:border-amber-primary/30 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive-light">
            <Icon size={48} strokeWidth={1} />
          </div>
        )}
        {/* Rating badge overlay — top-right */}
        <div className="absolute top-2 right-2 z-10">
          <RatingBadge rating={item.external_rating} />
        </div>
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
        {item.creator && (
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
        {item.city && (
          <p className="text-[12px] text-olive-light flex items-center gap-1 mt-1">
            <MapPin size={10} />
            {item.city}
          </p>
        )}
      </div>
    </Link>
  );
}
