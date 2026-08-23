import type { LatLng } from '@/lib/geo';

export interface RouteResult {
  /** [lat, lng] pairs, ready for a Leaflet Polyline. */
  path: [number, number][];
  distanceKm: number;
  durationSeconds: number;
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Fetches a driving route from OSRM's public demo server. That server is
 * rate-limited and offers no uptime guarantee, so callers should treat a
 * null result as "fall back to straight-line distance", not as an error.
 */
export async function fetchDrivingRoute(origin: LatLng, destination: LatLng): Promise<RouteResult | null> {
  const url = `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;

    return {
      path: (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
      distanceKm: route.distance / 1000,
      durationSeconds: route.duration,
    };
  } catch {
    return null;
  }
}
