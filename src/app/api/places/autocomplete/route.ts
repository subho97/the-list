import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use Nominatim (OpenStreetMap) — free, no API key needed
    // Restricted to establishments in India for food places
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(q)}` +
      `&format=json` +
      `&limit=8` +
      `&addressdetails=1` +
      `&countrycodes=in` +
      `&dedupe=1`,
      {
        headers: {
          'User-Agent': 'TheList/1.0 (community app; subhadipsinha123@gmail.com)',
          'Accept-Language': 'en',
        },
      }
    );

    const data = await res.json();

    const results = (data || [])
      .filter((place: any) => 
        // Only keep restaurants, cafes, pubs, bakeries, food-related places
        ['restaurant', 'cafe', 'pub', 'bar', 'fast_food', 'food_court', 'bakery',
         'ice_cream', 'confectionery', 'brewery', 'meal_delivery', 'meal_takeaway']
          .includes(place.type || place.category || '')
      )
      .map((place: any) => {
        const addr = place.address || {};
        const city = addr.city || addr.town || addr.county || addr.state_district || '';
        const area = addr.neighbourhood || addr.suburb || addr.subdistrict || '';
        
        return {
          display_name: place.display_name || '',
          name: place.name || place.display_name?.split(',')[0]?.trim() || '',
          lat: place.lat,
          lon: place.lon,
          type: place.type || place.category || '',
          city: city,
          area: area,
          // Generate a Google Maps search link
          maps_link: `https://www.google.com/maps/search/${encodeURIComponent(place.display_name?.split(',')[0]?.trim() || q)}/@${place.lat},${place.lon},17z`,
          osm_type: place.osm_type,
          osm_id: place.osm_id,
        };
      });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
