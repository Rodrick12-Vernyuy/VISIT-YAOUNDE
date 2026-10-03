import { Clock, MapPin, Mail, Phone, Ticket, Navigation } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/attractions/ShareButton';
import { AddToItineraryButton } from '@/components/attractions/AddToItineraryButton';
import type { Attraction } from '@/types';

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function AttractionInfoSidebar({ attraction }: { attraction: Attraction }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Visit information</h3>
          <ShareButton title={attraction.name} />
        </div>

        <Row icon={<Clock className="h-4 w-4" />} label="Opening hours" value={attraction.openingHours} />
        <Row icon={<Ticket className="h-4 w-4" />} label="Entry fee" value={attraction.entryFee} />
        <Row icon={<MapPin className="h-4 w-4" />} label="Address" value={`${attraction.address}, ${attraction.district}`} />
        {attraction.contactPhone && <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={attraction.contactPhone} />}
        {attraction.contactEmail && <Row icon={<Mail className="h-4 w-4" />} label="Email" value={attraction.contactEmail} />}

        <Button asChild className="w-full">
          <Link href={`/map?destination=${encodeURIComponent(attraction.slug)}`} className="inline-flex items-center justify-center gap-2">
            <Navigation className="h-4 w-4" /> Get directions
          </Link>
        </Button>
        <AddToItineraryButton attractionId={attraction.id} className="w-full" />
      </CardContent>
    </Card>
  );
}
