'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Item } from '@/lib/types';

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

// Lazy load leaflet CSS once
function useLeafletCSS() {
  useEffect(() => {
    const id = 'leaflet-css';
    if (!document.getElementById(id) && typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);
}

const cuisineEmojis: Record<string, string> = {
  pizza: '🍕', italian: '🍝', burger: '🍔', sushi: '🍣', japanese: '🍜',
  dimsum: '🥟', momo: '🥟', bakery: '🥐', cafe: '☕', indian: '🍛',
  'north indian': '🍛', 'south indian': '🍛', mediterranean: '🥙',
  shawarma: '🥙', 'middle eastern': '🧆', mexican: '🌮', ramen: '🍜',
  chinese: '🥡', thai: '🍜', korean: '🥘', steak: '🥩', seafood: '🦐',
  dessert: '🍨', 'street food': '🌮', 'food truck': '🚚', bbq: '🍖',
  breakfast: '🥞',
};

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
  return [12.9716, 77.5946];
}

// Spread overlapping markers so they don't stack perfectly on top of each other
const _coordSpreadCache = new Map<string, number>();
function getSpreadCoords(item: Item, index: number): [number, number] {
  const [lat, lng] = getCoords(item);
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const count = _coordSpreadCache.get(key) || 0;
  _coordSpreadCache.set(key, count + 1);
  if (count > 0) {
    // Offset each duplicate by ~250m in a triangle pattern
    const offset = count * 0.003;
    const angle = index * 2.399; // ~137.5deg (golden angle)
    return [lat + offset * Math.cos(angle), lng + offset * Math.sin(angle)];
  }
  return [lat, lng];
}

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

function getEmoji(cuisine: string | null): string {
  if (!cuisine) return '🍽️';
  const c = cuisine.toLowerCase();
  for (const [key, emoji] of Object.entries(cuisineEmojis)) {
    if (c.includes(key)) return emoji;
  }
  return '🍽️';
}

// Module-level L reference for creating custom icons
let _L: any = null;
function getL() {
  if (_L) return Promise.resolve(_L);
  return import('leaflet').then((L) => {
    _L = L;
    return L;
  }).catch(() => null);
}

// Orange map pin SVG matching the website's amber theme
const ORANGE_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#D97706"/>
  <circle cx="14" cy="14" r="8" fill="#FFFDE7"/>
  <text x="14" y="17" text-anchor="middle" font-size="10" fill="#D97706" font-weight="bold">🍽</text>
</svg>`;

// Internal component that renders map layers
function MapLayers({ items, userLocation }: { items: Item[]; userLocation: [number, number] | null }) {
  const [userIcon, setUserIcon] = useState<any>(null);
  const [foodIcon, setFoodIcon] = useState<any>(null);

  // Fix default marker icons and create custom icons
  useEffect(() => {
    getL().then((L) => {
      if (!L) return;
      // User location: blue dot
      setUserIcon(L.divIcon({
        className: '',
        html: '<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }));
      // Food markers: orange pin matching theme color
      const encoded = encodeURIComponent(ORANGE_PIN);
      setFoodIcon(L.icon({
        iconUrl: 'data:image/svg+xml,' + encoded,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -40],
      }));
    });
  }, []);

  // Fit bounds to show all items
  useEffect(() => {
    const tryFit = () => {
      const container = document.querySelector('.leaflet-container') as any;
      if (!container || !container._leaflet_map) { setTimeout(tryFit, 100); return; }
      getL().then((L) => {
        if (!L) return;
        const allCoords = items.map(i => getCoords(i));
        if (userLocation) allCoords.push(userLocation);
        const map = container._leaflet_map;
        if (allCoords.length > 1) {
          map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
        } else if (allCoords.length === 1) {
          map.setView(allCoords[0], 13);
        }
      });
    };
    const timer = setTimeout(tryFit, 350);
    return () => clearTimeout(timer);
  }, [items, userLocation]);

  // Reset coordinate spread counter
  _coordSpreadCache.clear();

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={18}
        maxZoom={19}
      />
      {items.map((item, idx) => {
        const coords = getSpreadCoords(item, idx);
        return (
          <Marker key={item.id} position={coords} icon={foodIcon || undefined}>
            <Popup maxWidth={250}>
              <div style={{ fontFamily: 'system-ui,sans-serif', minWidth: 180 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {getEmoji(item.cuisine)} <strong>{item.title}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {item.cuisine || ''}{item.city ? ` · ${item.city}` : ''}
                </div>
                {item.must_try && (
                  <div style={{ fontSize: 12, color: '#D97706', marginTop: 4 }}>
                    ✦ {item.must_try}
                  </div>
                )}
                <div style={{ marginTop: 6 }}>
                  <a
                    href={item.google_maps_link || `/items/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#D97706', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Open in Maps ↗
                  </a>
                  &nbsp;·&nbsp;
                  <a
                    href={`/items/${item.id}`}
                    style={{ fontSize: 12, color: '#D97706', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Details →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon || undefined} />
      )}
    </>
  );
}

export default function MapView({ items }: { items: Item[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useLeafletCSS();

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const defaultCenter: [number, number] = items.length > 0
    ? getCoords(items[0])
    : [12.9716, 77.5946];

  if (mapError) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
        <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
        <p className="text-sm text-stone-700 font-medium mb-1">Map couldn't load</p>
        <p className="text-xs text-olive-light mb-4">{mapError}</p>
        <button
          onClick={() => { setMapError(null); window.location.reload(); }}
          className="px-4 py-2 bg-amber-primary text-white rounded-lg text-xs font-medium hover:bg-amber-dark transition-colors"
        >
          Reload
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin size={40} className="mx-auto text-olive-light mb-3" />
        <p className="text-sm text-olive">No places found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="w-full h-[400px] rounded-xl border border-stone-200 shadow-sm z-0 relative overflow-hidden">
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-[1000]">
            <div className="text-center">
              <MapPin size={24} className="mx-auto text-olive-light animate-pulse" />
              <p className="text-xs text-olive-light mt-2">Loading map...</p>
            </div>
          </div>
        )}
        <MapContainer
          center={defaultCenter}
          zoom={11}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
          whenReady={handleMapReady}
        >
          <MapLayers items={items} userLocation={userLocation} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-olive-light">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm inline-block" />
          Your location
        </span>
        <span className="text-olive">|</span>
        <span>{items.length} place{items.length !== 1 ? 's' : ''}</span>
        {userLocation && (
          <span>
            · {items.filter(i => haversine(userLocation[0], userLocation[1], ...getCoords(i)) < 5).length} within 5km
          </span>
        )}
      </div>

      {/* Items list below map */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.map(item => {
          const dist = userLocation
            ? Math.round(haversine(userLocation[0], userLocation[1], ...getCoords(item)) * 10) / 10
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
                  {dist !== null ? ` · ${dist} km` : ''}
                  {item.must_try ? ` · ✦ ${item.must_try}` : ''}
                </p>
              </div>
              {item.google_maps_link && (
                <a
                  href={item.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-amber-primary font-medium shrink-0 px-2.5 py-1.5 border border-amber-primary/20 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <MapPin size={12} className="inline mr-1" />
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
