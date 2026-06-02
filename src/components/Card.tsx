import Link from 'next/link';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed } from 'lucide-react';
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

export default function Card({ item }: CardProps) {
  const Icon = typeIcons[item.type];

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-stone-200/50 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive-light">
            <Icon size={48} strokeWidth={1} />
          </div>
        )}
        {/* Rating badge overlay */}
        <div className="absolute top-2 right-2">
          <RatingBadge rating={item.external_rating} />
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-medium text-stone-600">
          {typeLabels[item.type]}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-stone-800 text-sm line-clamp-2 group-hover:text-amber-dark transition-colors">
          {item.title}
        </h3>
        {item.creator && (
          <p className="text-xs text-olive mt-1 truncate">{item.creator}</p>
        )}
        {item.year && (
          <p className="text-xs text-olive-light mt-0.5">{item.year}</p>
        )}
      </div>
    </Link>
  );
}
