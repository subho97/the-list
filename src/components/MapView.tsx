'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Item } from '@/lib/types';

interface MapViewProps {
  items: Item[];
}

// Area-level coordinates as fallback
const areaCoords: Record<string, [number, number]> = {
  'HSR Layout': [12.9116, 77.6389],
  'Whitefield': [12.9698, 77.7500],
  'BTM 2nd Stage': [12.9166, 77.6101],
  'JP Nagar': [12.9063, 77.5857],
  'Electronic City': [12.8456, 77.6603],
  'Phoenix Mall of Asia': [12.9945, 77.5971],
  'Bangalore': [12.9716, 77.5946],
  'Mysore': [12.2958, 76.6394],
};

function getCoords(item: Item): [number, number] {
  if (item.lat && item.lng) return [item.lat, item.lng];
  if (item.city && areaCoords[item.city]) return areaCoords[item.city];
  return [12.9716, 77.5946]; // default Bangalore
}

const cuisineEmojis: Record<string, string> = {
  pizza: '🍕', italian: '🍝', burger: '🍔', sushi: '🍣', japanese: '🍜',
  dimsum: '🥟', momo: '🥟', bakery: '🥐', cafe: '☕', indian: '🍛',
  'north indian': '🍛', 'south indian': '🍛', mediterranean: '🥙', shawarma: '🥙',
  'middle eastern': '🧆', mexican: '🌮', ramen: '🍜', chinese: '🥡',
  thai: '🍜', korean: '🥘', steak: '🥩', seafood: '🦐', dessert: '🍨',
  'street food': '🌮', 'food truck': '🚚', bbq: '🍖', breakfast: '🥞',
};

function getEmoji(cuisine: string | null): string {
  if (!cuisine) return '🍽️';
  const c = cuisine.toLowerCase();
  for (const [key, emoji] of Object.entries(cuisineEmojis)) {
    if (c.includes(key)) return emoji;
  }
  return '🍽️';
}

export default function MapView({ items }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {} // silent fail
      );
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin size={40} className="mx-auto text-olive-light mb-3" />
        <p className="text-sm text-olive">No places found on the map.</p>
      </div>
    );
  }

  // Generate static map URL using location data
  const center = userLocation || [12.9716, 77.5946];

  return (
    <div className="space-y-3">
      {/* Map area */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        {/* Static map header */}
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-4 text-center">
          <div className="text-2xl mb-1">🗺️</div>
          <p className="text-sm font-medium text-white/90">
            {items.length} place{items.length !== 1 ? 's' : ''} on the map
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            {userLocation ? '📍 Your location detected' : '📍 Bangalore area'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex flex-wrap gap-2">
            {[...new Set(items.filter((i: Item) => i.city).map((i: Item) => i.city!))].map(city => (
              <span key={city} className="text-xs bg-amber-primary/10 text-amber-primary px-2.5 py-1 rounded-full font-medium">
                {city} ({items.filter(i => i.city === city).length})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Items as location cards */}
      <div className="space-y-2">
        {items.map(item => {
          const [lat, lng] = getCoords(item);
          const dist = userLocation
            ? Math.round(haversine(userLocation[0], userLocation[1], lat, lng) * 10) / 10
            : null;
          return (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-primary/30 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200/60 to-amber-300/30 flex items-center justify-center text-lg shrink-0">
                {getEmoji(item.cuisine)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm group-hover:text-amber-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-olive-light">
                  {item.city || 'Bangalore'}
                  {item.cuisine ? ` · ${item.cuisine}` : ''}
                  {dist ? ` · ${dist} km` : ''}
                </p>
                {item.must_try && (
                  <p className="text-xs text-amber-primary mt-0.5">✨ {item.must_try}</p>
                )}
              </div>
              {item.google_maps_link && (
                <a
                  href={item.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-amber-primary hover:text-amber-dark font-medium shrink-0 flex items-center gap-1 px-2.5 py-1.5 border border-amber-primary/20 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <MapPin size={12} />
                  Maps
                </a>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Haversine distance formula (in km)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
