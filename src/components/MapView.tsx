'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Item } from '@/lib/types';

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

function getEmoji(cuisine: string | null): string {
  if (!cuisine) return '🍽️';
  const c = cuisine.toLowerCase();
  for (const [key, emoji] of Object.entries(cuisineEmojis)) {
    if (c.includes(key)) return emoji;
  }
  return '🍽️';
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

export default function MapView({ items }: { items: Item[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  // Inject Leaflet CSS dynamically
  useEffect(() => {
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Fix default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.prototype.options.iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
        L.Icon.Default.prototype.options.iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
        L.Icon.Default.prototype.options.shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

        const map = L.map(mapRef.current!, {
          center: [12.9716, 77.5946],
          zoom: 11,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        // Invalidate size to handle the loading overlay
        setTimeout(() => map.invalidateSize(), 100);

        mapInstance.current = map;
      } catch (err) {
        console.error('Failed to load map:', err);
        setMapError('Map failed to load. Try reloading the page.');
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Add markers when items or user location change
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof (map as any).constructor.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each item
    items.forEach((item) => {
      const [lat, lng] = getCoords(item);
      const marker = (map as any).constructor.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:180px">
          <div style="font-size:20px;margin-bottom:4px">${getEmoji(item.cuisine)} <strong>${item.title}</strong></div>
          <div style="font-size:12px;color:#666">${item.cuisine || ''}${item.city ? ' · ' + item.city : ''}</div>
          ${item.must_try ? `<div style="font-size:12px;color:#D97706;margin-top:4px">✨ ${item.must_try}</div>` : ''}
          <div style="margin-top:6px">
            <a href="${item.google_maps_link || `/items/${item.id}`}" target="_blank" style="font-size:12px;color:#D97706;text-decoration:none;font-weight:500">Open in Maps ↗</a>
            &nbsp;·&nbsp;
            <a href="/items/${item.id}" style="font-size:12px;color:#D97706;text-decoration:none;font-weight:500">Details →</a>
          </div>
        </div>
      `, { maxWidth: 250 });
    });

    // Add user location marker
    if (userLocation) {
      const userIcon = (map as any).constructor.divIcon({
        className: '',
        html: '<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      (map as any).constructor.marker(userLocation, { icon: userIcon }).addTo(map)
        .bindPopup('<div style="font-size:12px">📍 Your location</div>');

      // Fit bounds to show all markers + user
      const allCoords = items.map(i => getCoords(i));
      allCoords.push(userLocation);
      if (allCoords.length > 1) {
        const bounds = (map as any).constructor.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (items.length > 0) {
      // User location unavailable, fit to items
      const allCoords = items.map(i => getCoords(i));
      if (allCoords.length > 1) {
        const bounds = (map as any).constructor.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Recalculate map size (handles the loading overlay being removed)
    setTimeout(() => map.invalidateSize(), 50);
  }, [items, userLocation, mapInstance.current]);

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
      <div ref={mapRef} className="w-full h-[400px] rounded-xl border border-stone-200 shadow-sm z-0 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50 rounded-xl">
          <div className="text-center">
            <MapPin size={24} className="mx-auto text-olive-light animate-pulse" />
            <p className="text-xs text-olive-light mt-2">Loading map...</p>
          </div>
        </div>
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
                  {item.must_try ? ` · ✨ ${item.must_try}` : ''}
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
