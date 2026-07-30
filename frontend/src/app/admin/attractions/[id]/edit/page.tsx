'use client';

import { useParams } from 'next/navigation';
import { AttractionForm } from '@/components/admin/AttractionForm';
import { useAdminAttraction } from '@/lib/queries/attractions';

export default function EditAttractionPage() {
  const params = useParams<{ id: string }>();
  const { data: attraction, isLoading } = useAdminAttraction(params.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Edit attraction</h1>
      <p className="mt-1 text-muted-foreground">Update details and manage this attraction&apos;s photo gallery.</p>
      <div className="mt-8 max-w-3xl">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : attraction ? (
          <AttractionForm mode="edit" attraction={attraction} />
        ) : (
          <p className="text-muted-foreground">Attraction not found.</p>
        )}
      </div>
    </div>
  );
}
