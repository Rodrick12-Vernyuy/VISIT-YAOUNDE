'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Navigation, LocateFixed, Loader2 } from 'lucide-react';
import type { Attraction } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistanceKm, formatDurationSeconds, haversineDistanceKm, reverseGeocodeLocation } from '@/lib/geo';
import { fetchDrivingRoute, isValidLatLng, type RouteResult } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { AddToItineraryButton } from '@/components/attractions/AddToItineraryButton';

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

/** Centers on the user or fits the complete road route when one is available. */
function MapViewport({ userCoords, route }: { userCoords: [number, number] | null; route: RouteResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (route?.path.length) {
      map.fitBounds(route.path, { padding: [40, 40], maxZoom: 15 });
    } else if (userCoords) {
      map.setView(userCoords, 14);
    }
  }, [map, route, userCoords]);
  return null;
}

export function AttractionMap({
  attractions,
  height = '480px',
  zoom = 12,
  center,
  destinationSlug,
}: AttractionMapProps & { destinationSlug?: string }) {
  const mapCenter = useMemo(() => center ?? YAOUNDE_CENTER, [center]);
  const { coords: rawUserCoords, status: locateStatus, error: locationError, locate } = useGeolocation();
  const userCoords = rawUserCoords && isValidLatLng(rawUserCoords) ? rawUserCoords : null;
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<{ attractionId: string; route: RouteResult } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  const routeRequestId = useRef(0);
  const autoRoutedDestination = useRef<string | null>(null);
  const requestedDestination = destinationSlug
    ? attractions.find((attraction) => attraction.slug === destinationSlug)
    : undefined;
  const routeDestinationId = selectedDestinationId ?? requestedDestination?.id ?? null;
  const routeDestination = attractions.find((attraction) => attraction.id === routeDestinationId);
  const destinationError =
    destinationSlug && attractions.length > 0 && !requestedDestination
      ? 'This destination could not be found on the map.'
      : routeDestination && !isValidLatLng({ lat: routeDestination.latitude, lng: routeDestination.longitude })
        ? 'This destination has invalid coordinates, so directions cannot be calculated.'
        : null;

  const requestDirections = useCallback(async (attraction: Attraction) => {
    const destination = { lat: attraction.latitude, lng: attraction.longitude };
    if (!isValidLatLng(destination)) {
      setRouteError('This destination has invalid coordinates, so directions cannot be calculated.');
      return;
    }
    const requestId = ++routeRequestId.current;
    setRouteError(null);
    setActiveRoute(null);
    setSelectedDestinationId(attraction.id);
    setIsRouting(true);

    // Wait for the fresh GPS result. Reading `userCoords` here could use the
    // previous React state value and route from the wrong place.
    const origin = await locate();
    if (!origin || requestId !== routeRequestId.current) {
      if (requestId === routeRequestId.current) setIsRouting(false);
      return;
    }

    try {
      const route = await fetchDrivingRoute(origin, destination);
      if (requestId === routeRequestId.current) {
        setActiveRoute({ attractionId: attraction.id, route });
      }
    } catch {
      if (requestId === routeRequestId.current) {
        setRouteError("We couldn't calculate a route to this destination right now. Please try again.");
      }
    } finally {
      if (requestId === routeRequestId.current) setIsRouting(false);
    }
  }, [locate]);

  function handleDirections(attraction: Attraction) {
    void requestDirections(attraction);
  }

  function handleLocateMe() {
    setUserLocationName(null);
    void locate();
  }

  useEffect(() => {
    if (!userCoords) {
      return;
    }
    let cancelled = false;
    reverseGeocodeLocation(userCoords).then((name) => {
      if (!cancelled) setUserLocationName(name);
    });
    return () => {
      cancelled = true;
    };
  }, [userCoords]);

  // The attraction-detail "Get directions" link opens this page with a
  // destination. Treat it exactly like pressing Directions in a marker popup:
  // ask for a fresh location before requesting the road route.
  useEffect(() => {
    if (!destinationSlug || !requestedDestination || destinationError) return;
    if (autoRoutedDestination.current === destinationSlug) return;
    autoRoutedDestination.current = destinationSlug;
    void requestDirections(requestedDestination);
  }, [destinationError, destinationSlug, requestedDestination, requestDirections]);

  const locationMessage =
    locateStatus === 'unsupported'
      ? 'Location services are unavailable in this browser.'
      : locateStatus === 'error'
        ? locationError
        : null;
  const routing = isRouting && !routeError && !destinationError;

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl border border-border">
      <div className="absolute right-3 top-3 z-[1000]">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shadow-md"
          onClick={handleLocateMe}
          disabled={locateStatus === 'loading'}
        >
          {locateStatus === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {userCoords ? 'Update my location' : 'Locate Me'}
        </Button>
        {userCoords && (
          <p className="mt-2 max-w-64 rounded-md bg-background/95 px-3 py-2 text-xs shadow-md">
            <span className="font-medium">Your location:</span>{' '}
            {userLocationName ?? 'Finding the place name...'}
          </p>
        )}
      </div>

      {(routeError || destinationError || locationMessage) && (
        <p role="alert" className="absolute bottom-3 left-3 right-3 z-[1000] rounded-md bg-background/95 px-3 py-2 text-sm text-destructive shadow-md">
          {routeError ?? destinationError ?? locationMessage}
        </p>
      )}
      {routing && (
        <p role="status" className="absolute bottom-3 left-3 z-[1000] rounded-md bg-background/95 px-3 py-2 text-sm shadow-md">
          Calculating road route…
        </p>
      )}
      {activeRoute?.attractionId === routeDestinationId && !routing && (
        <p role="status" className="absolute bottom-3 left-3 z-[1000] rounded-md bg-background/95 px-3 py-2 text-sm shadow-md">
          {formatDistanceKm(activeRoute.route.distanceKm)} · {formatDurationSeconds(activeRoute.route.durationSeconds)} to{' '}
          {attractions.find((attraction) => attraction.id === activeRoute.attractionId)?.name}
        </p>
      )}

      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport
          userCoords={userCoords ? [userCoords.lat, userCoords.lng] : null}
          route={activeRoute?.route ?? null}
        />

        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
            <Popup>
              <p className="font-semibold">You are here</p>
              <p className="mt-1 text-sm text-muted-foreground">{userLocationName ?? 'Finding the name of this location…'}</p>
            </Popup>
          </Marker>
        )}

        {activeRoute?.attractionId === routeDestinationId && (
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
                      disabled={(routing && routeDestinationId === attraction.id) || locateStatus === 'loading'}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-60"
                    >
                      {routing && routeDestinationId === attraction.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      Directions
                    </button>
                  </div>
                  <AddToItineraryButton attractionId={attraction.id} className="h-8 px-2 text-xs" />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
