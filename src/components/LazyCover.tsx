'use client';

import { useState, useRef, useEffect } from 'react';
import { Film, BookOpen, UtensilsCrossed } from 'lucide-react';

interface LazyCoverProps {
  src: string | null;
  alt: string;
  type: 'movie' | 'book' | 'food';
  cuisine?: string | null;
  priority?: boolean;
}

const typeIcons = {
  movie: Film,
  book: BookOpen,
  food: UtensilsCrossed,
};

const cuisineEmojis: Record<string, string> = {
  pizza: '🍕', italian: '🍝', sushi: '🍣', japanese: '🍜',
  bakery: '🥐', coffee: '☕', burger: '🍔', indian: '🍛',
  ramen: '🍜', mexican: '🌮', thai: '🍜', mediterranean: '🥙',
  street: '🌮', dimsum: '🥟', dumpling: '🥟', momo: '🥟',
};

const cuisineGradients: Record<string, string> = {
  pizza: 'from-red-200/60 to-red-300/30', italian: 'from-amber-200/60 to-amber-300/30',
  sushi: 'from-emerald-200/60 to-emerald-300/30', bakery: 'from-orange-200/60 to-orange-300/30',
  coffee: 'from-yellow-200/60 to-yellow-300/30', burger: 'from-red-200/60 to-red-300/30',
  indian: 'from-orange-300/60 to-orange-400/30', ramen: 'from-red-200/60 to-red-300/30',
};

export default function LazyCover({ src, alt, type, cuisine, priority }: LazyCoverProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const Icon = typeIcons[type];

  // Start loading the image immediately
  useEffect(() => {
    if (!src || !imgRef.current) return;

    // If the image is already cached, it'll load instantly
    imgRef.current.src = src;
  }, [src]);

  return (
    <>
      {/* Placeholder — always visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
          {type === 'food' ? (
            <span className="text-4xl md:text-5xl opacity-80">
              {cuisine ? cuisineEmojis[cuisine.toLowerCase()] || '🍽️' : '🍽️'}
            </span>
          ) : (
            <Icon size={36} strokeWidth={1} className="text-stone-300" />
          )}
        </div>
      )}

      {/* Actual image — fades in when loaded */}
      <img
        ref={imgRef}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{ display: errored ? 'none' : undefined }}
      />
    </>
  );
}
