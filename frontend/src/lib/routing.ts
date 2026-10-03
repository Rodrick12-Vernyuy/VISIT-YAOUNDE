import type { LatLng } from '@/lib/geo';

export interface RouteResult {
  /** [lat, lng] pairs, ready for a Leaflet Polyline. */
  path: [number, number][];
  distanceKm: number;
  durationSeconds: number;
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export function isValidLatLng(point: LatLng): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

/** Fetch an actual road route; routing failures are surfaced instead of drawing a straight line. */
export async function fetchDrivingRoute(origin: LatLng, destination: LatLng): Promise<RouteResult> {
  if (!isValidLatLng(origin) || !isValidLatLng(destination)) {
    throw new Error('This destination has invalid coordinates, so directions cannot be calculated.');
  }

  const url = `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error('OSRM request failed');

    const data = await res.json();
    const route = data.routes?.[0];
    if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
      throw new Error('No road route was returned');
    }

    return {
      path: (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
      distanceKm: route.distance / 1000,
      durationSeconds: route.duration,
    };
  } finally {
    clearTimeout(timeout);
  }
}
