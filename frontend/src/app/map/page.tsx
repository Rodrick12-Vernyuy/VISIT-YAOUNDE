import MapPageClient from './MapPageClient';

interface MapPageProps {
  searchParams: Promise<{ destination?: string | string[] }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const destinationSlug = typeof params.destination === 'string' ? params.destination : undefined;
  return <MapPageClient destinationSlug={destinationSlug} />;
}
