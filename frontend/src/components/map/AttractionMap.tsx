'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Attraction } from '@/types';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const YAOUNDE_CENTER: [number, number] = [3.8667, 11.5167];

interface AttractionMapProps {
  attractions: Attraction[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}

export function AttractionMap({ attractions, height = '480px', zoom = 12, center }: AttractionMapProps) {
  const mapCenter = useMemo(() => center ?? YAOUNDE_CENTER, [center]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-border">
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {attractions.map((attraction) => (
          <Marker key={attraction.id} position={[attraction.latitude, attraction.longitude]} icon={markerIcon}>
            <Popup minWidth={200}>
              <div className="space-y-1">
                <p className="font-semibold">{attraction.name}</p>
                <p className="text-xs text-muted-foreground">{attraction.category.name}</p>
                <Link href={`/attractions/${attraction.slug}`} className="text-sm text-primary underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
