import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AttractionGallery } from '@/components/attractions/AttractionGallery';
import { AttractionInfoSidebar } from '@/components/attractions/AttractionInfoSidebar';
import { FavoriteButton } from '@/components/attractions/FavoriteButton';
import { NearbyAttractions } from '@/components/attractions/NearbyAttractions';
import { ReviewsSection } from '@/components/attractions/ReviewsSection';
import { StarRating } from '@/components/attractions/StarRating';
import { AttractionMapClient } from '@/components/map/AttractionMapClient';
import { Badge } from '@/components/ui/badge';
import { fetchAttractionBySlug } from '@/lib/api-server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchAttractionBySlug(slug);
  if (!data) return {};

  return {
    title: data.attraction.name,
    description: data.attraction.shortDescription,
  };
}

function InfoBlock({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{content}</p>
    </div>
  );
}

export default async function AttractionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchAttractionBySlug(slug);
  if (!data) notFound();

  const { attraction, nearby } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{attraction.category.name}</Badge>
          <Badge variant="outline">{attraction.district}</Badge>
          {attraction.reviewCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <StarRating value={attraction.averageRating} size={14} />
              {attraction.averageRating.toFixed(1)} ({attraction.reviewCount})
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{attraction.name}</h1>
          <FavoriteButton attractionId={attraction.id} />
        </div>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{attraction.shortDescription}</p>
      </div>

      <AttractionGallery images={attraction.images} name={attraction.name} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <InfoBlock title="About" content={attraction.description} />
          <InfoBlock title="History" content={attraction.history} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attraction.estimatedVisitDuration && (
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated visit</p>
                <p className="mt-1 font-medium">{attraction.estimatedVisitDuration}</p>
              </div>
            )}
            {attraction.bestVisitingTime && (
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Best time to visit</p>
                <p className="mt-1 font-medium">{attraction.bestVisitingTime}</p>
              </div>
            )}
          </div>

          <InfoBlock title="Visitor tips" content={attraction.visitorTips} />
          <InfoBlock title="Safety information" content={attraction.safetyInfo} />
          <InfoBlock title="Accessibility" content={attraction.accessibilityInfo} />

          <div>
            <h2 className="font-display text-xl font-semibold">Location</h2>
            <div className="mt-3">
              <AttractionMapClient
                attractions={[attraction]}
                center={[attraction.latitude, attraction.longitude]}
                zoom={15}
                height="360px"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            <AttractionInfoSidebar attraction={attraction} />
          </div>
        </div>
      </div>

      <ReviewsSection
        attractionId={attraction.id}
        averageRating={attraction.averageRating}
        reviewCount={attraction.reviewCount}
      />

      <NearbyAttractions attractions={nearby} />
    </div>
  );
}
