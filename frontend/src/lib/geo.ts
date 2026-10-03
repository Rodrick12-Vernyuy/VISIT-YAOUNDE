export interface LatLng {
  lat: number;
  lng: number;
}
function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometers. */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDurationSeconds(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

/** Returns a human-readable nearby place name without storing the user's location. */
export async function reverseGeocodeLocation(point: LatLng): Promise<string | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: '16',
    addressdetails: '1',
  });
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    if (!response.ok) return null;
    const result = (await response.json()) as {
      name?: string;
      display_name?: string;
      address?: { road?: string; neighbourhood?: string; suburb?: string; city?: string; town?: string; village?: string };
    };
    if (result.name) return result.name;

    const address = result.address;
    const locality = address?.neighbourhood ?? address?.suburb ?? address?.city ?? address?.town ?? address?.village;
    if (address?.road && locality) return `${address.road}, ${locality}`;
    return locality ?? address?.road ?? result.display_name?.split(',').slice(0, 2).join(',') ?? null;
  } catch {
    return null;
  }
}

