'use client';

import { MapPin } from 'lucide-react';

interface MapViewProps {
  items: Array<{
    id: string;
    title: string;
    cuisine: string | null;
    city: string | null;
    google_maps_link: string | null;
  }>;
}

// Group items by city for the map view
export default function MapView({ items }: MapViewProps) {
  // Group by city
  const cities = new Map<string, typeof items>();
  for (const item of items) {
    const city = item.city || 'Unknown';
    if (!cities.has(city)) cities.set(city, []);
    cities.get(city)!.push(item);
  }

  return (
    <div className="space-y-4">
      {Array.from(cities.entries()).map(([city, cityItems]) => (
        <div key={city} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          {/* City header */}
          <div className="bg-amber-primary/5 px-5 py-3 border-b border-stone-100 flex items-center gap-2">
            <MapPin size={16} className="text-amber-primary" />
            <h3 className="font-semibold text-stone-800 text-sm">{city}</h3>
            <span className="text-xs text-olive-light ml-auto">{cityItems.length} place{cityItems.length > 1 ? 's' : ''}</span>
          </div>

          {/* Items in this city */}
          <div className="divide-y divide-stone-100">
            {cityItems.map((item) => (
              <a
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors duration-150"
              >
                <div className="w-2 h-2 rounded-full bg-amber-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{item.title}</p>
                </div>
                {item.google_maps_link && (
                  <a
                    href={item.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-amber-primary hover:text-amber-dark font-medium shrink-0 flex items-center gap-1"
                  >
                    <MapPin size={12} />
                    Maps
                  </a>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
