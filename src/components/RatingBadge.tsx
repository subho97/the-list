import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number | null;
  size?: 'sm' | 'md';
}

export default function RatingBadge({ rating, size = 'sm' }: RatingBadgeProps) {
  if (!rating) return null;

  const isHighQuality = rating >= 8.0;

  const sizeClasses = size === 'sm'
    ? 'text-[12px] px-2.5 py-0.5 gap-1'
    : 'text-sm px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full ${
        isHighQuality
          ? 'bg-amber-primary text-white'
          : 'bg-stone-200 text-stone-500'
      } ${sizeClasses}`}
    >
      <Star
        size={size === 'sm' ? 10 : 14}
        className={isHighQuality ? 'fill-white text-white' : 'fill-stone-500 text-stone-500'}
      />
      {rating.toFixed(1)}
    </span>
  );
}
