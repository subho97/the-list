interface RatingBadgeProps {
  rating: number | null;
  size?: 'sm' | 'md';
}

export default function RatingBadge({ rating, size = 'sm' }: RatingBadgeProps) {
  if (!rating) return null;

  const isHighQuality = rating >= 8.0;

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full ${
        isHighQuality
          ? 'bg-amber-primary text-white'
          : 'bg-olive-light/30 text-olive'
      } ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      {rating.toFixed(1)}
    </span>
  );
}
