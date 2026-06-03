import Link from 'next/link';
import { Item } from '@/lib/types';
import { MapPin, ChevronRight } from 'lucide-react';
import VoteButtons from './VoteButtons';

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

function getCuisineKey(cuisine: string | null): string {
  if (!cuisine) return 'default';
  const c = cuisine.toLowerCase();
  for (const key of Object.keys(cuisineEmojis)) {
    if (c.includes(key)) return key;
  }
  return 'default';
}

function getEmoji(cuisine: string | null): string {
  return cuisineEmojis[getCuisineKey(cuisine)] || '🍽️';
}

export default function FoodListItem({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-primary/30 hover:shadow-sm transition-all duration-150 group"
    >
      {/* Emoji */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-200/60 to-orange-300/30 flex items-center justify-center text-2xl shrink-0">
        {getEmoji(item.cuisine)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 group-hover:text-amber-primary transition-colors duration-150">
          {item.title}
        </p>
        {item.cuisine && (
          <p className="text-xs text-olive mt-0.5">{item.cuisine}</p>
        )}
        {item.must_try && (
          <p className="text-xs text-amber-primary mt-0.5">✨ {item.must_try}</p>
        )}
        {item.notes && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">📝 {item.notes}</p>
        )}
        {(item.area || item.city) && (
          <p className="text-xs text-olive-light flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            {item.area || item.city}
          </p>
        )}
      </div>

      {/* Arrow + Votes */}
      <div className="flex items-center gap-2 shrink-0">
        <VoteButtons itemId={item.id} initialUpvotes={item.upvotes} initialDownvotes={item.downvotes} />
        <ChevronRight size={18} className="text-olive-light group-hover:text-amber-primary transition-colors duration-150" />
      </div>
    </Link>
  );
}
