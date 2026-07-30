import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedAttractions } from '@/components/home/FeaturedAttractions';
import { HomeMapPreview } from '@/components/home/HomeMapPreview';

export default function HomePage() {
  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Browse by category</h2>
          <p className="mt-1 text-muted-foreground">Find exactly the kind of experience you&apos;re after.</p>
        </div>
        <CategoryGrid />
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured attractions</h2>
            <p className="mt-1 text-muted-foreground">Hand-picked highlights across Yaoundé.</p>
          </div>
          <FeaturedAttractions />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Explore the map</h2>
          <p className="mt-1 text-muted-foreground">See everything at a glance, or open the full live map.</p>
        </div>
        <HomeMapPreview />
      </section>
    </div>
  );
}
