'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Navigation, LocateFixed, Loader2 } from 'lucide-react';
import type { Attraction } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistanceKm, formatDurationSeconds, googleMapsDirectionsUrl, haversineDistanceKm } from '@/lib/geo';
import { fetchDrivingRoute, type RouteResult } from '@/lib/routing';
import { Button } from '@/components/ui/button';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: '',
  html: '<span class="block h-4 w-4 rounded-full border-2 border-white bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.35)]"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const YAOUNDE_CENTER: [number, number] = [3.8667, 11.5167];

interface AttractionMapProps {
  attractions: Attraction[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}

/** Recenters/fits the map whenever the active route or user location changes. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export function AttractionMap({ attractions, height = '480px', zoom = 12, center }: AttractionMapProps) {
  const mapCenter = useMemo(() => center ?? YAOUNDE_CENTER, [center]);
  const { coords: userCoords, status: locateStatus, locate } = useGeolocation();
  const [activeRoute, setActiveRoute] = useState<{ attractionId: string; route: RouteResult | null } | null>(null);
  const [routing, setRouting] = useState<string | null>(null);

  async function handleDirections(attraction: Attraction) {
    if (!userCoords) {
      locate();
      return;
    }
    setRouting(attraction.id);
    const route = await fetchDrivingRoute(userCoords, { lat: attraction.latitude, lng: attraction.longitude });
    setActiveRoute({ attractionId: attraction.id, route });
    setRouting(null);
  }

  const fitPoints: [number, number][] = activeRoute?.route
    ? activeRoute.route.path
    : userCoords
      ? [
          [userCoords.lat, userCoords.lng],
          ...attractions.map((a): [number, number] => [a.latitude, a.longitude]),
        ]
      : [];

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl border border-border">
      <div className="absolute right-3 top-3 z-[1000]">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shadow-md"
          onClick={locate}
          disabled={locateStatus === 'loading'}
        >
          {locateStatus === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {userCoords ? 'Update my location' : 'Find my location'}
        </Button>
        {locateStatus === 'error' && (
          <p className="mt-1 max-w-[220px] rounded-md bg-background/90 px-2 py-1 text-xs text-destructive shadow-sm">
            Couldn&apos;t get your location. Check your browser&apos;s location permission.
          </p>
        )}
      </div>

      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {fitPoints.length > 1 && <FitBounds points={fitPoints} />}

        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {activeRoute?.route && (
          <Polyline positions={activeRoute.route.path} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} />
        )}

        {attractions.map((attraction) => {
          const distanceKm = userCoords
            ? haversineDistanceKm(userCoords, { lat: attraction.latitude, lng: attraction.longitude })
            : null;
          const isActiveRoute = activeRoute?.attractionId === attraction.id;

          return (
            <Marker key={attraction.id} position={[attraction.latitude, attraction.longitude]} icon={markerIcon}>
              <Popup minWidth={220}>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold">{attraction.name}</p>
                    <p className="text-xs text-muted-foreground">{attraction.category.name}</p>
                  </div>

                  {distanceKm !== null && (
                    <p className="text-xs text-muted-foreground">
                      {isActiveRoute && activeRoute?.route
                        ? `${formatDistanceKm(activeRoute.route.distanceKm)} · ${formatDurationSeconds(activeRoute.route.durationSeconds)} drive`
                        : `${formatDistanceKm(distanceKm)} away (straight line)`}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link href={`/attractions/${attraction.slug}`} className="text-sm text-primary underline">
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDirections(attraction)}
                      disabled={routing === attraction.id}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-60"
                    >
                      {routing === attraction.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      Directions
                    </button>
                  </div>

                  <a
                    href={googleMapsDirectionsUrl(
                      { lat: attraction.latitude, lng: attraction.longitude },
                      userCoords
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-muted-foreground underline underline-offset-2"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
