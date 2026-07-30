import { AttractionCard } from '@/components/attractions/AttractionCard';
import type { Attraction } from '@/types';

export function NearbyAttractions({ attractions }: { attractions: Attraction[] }) {
  if (!attractions.length) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold">Nearby attractions</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((attraction) => (
          <AttractionCard key={attraction.id} attraction={attraction} />
        ))}
      </div>
    </section>
  );
}
